package storage

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Storage struct {
	client        *s3.Client
	presignClient *s3.PresignClient
	bucketName    string
}

func NewS3Storage(ctx context.Context, region, accessKey, secretKey, bucketName, baseURL string) (*S3Storage, error) {
	if region == "" || accessKey == "" || secretKey == "" || bucketName == "" {
		return nil, fmt.Errorf("missing AWS S3 configuration")
	}

	opts := []func(*config.LoadOptions) error{
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	}

	// Use custom endpoint for S3-compatible storage (MinIO, R2, Spaces, etc)
	if baseURL != "" {
		opts = append(opts, config.WithEndpointResolverWithOptions(
			aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:               baseURL,
					SigningRegion:     region,
					HostnameImmutable: true,
				}, nil
			}),
		))
	}

	cfg, err := config.LoadDefaultConfig(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %w", err)
	}

	var client *s3.Client
	if baseURL != "" {
		client = s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.UsePathStyle = true
		})
	} else {
		client = s3.NewFromConfig(cfg)
	}
	
	presignClient := s3.NewPresignClient(client)

	slog.Info("S3 Storage initialized", "bucket", bucketName, "region", region)

	return &S3Storage{
		client:        client,
		presignClient: presignClient,
		bucketName:    bucketName,
	}, nil
}

// UploadPhoto uploads an image to S3 and returns the Object Key.
func (s *S3Storage) UploadPhoto(ctx context.Context, file io.Reader, filename string, contentType string) (string, error) {
	ext := filepath.Ext(filename)
	newFilename := fmt.Sprintf("products/%s%s", uuid.New().String(), ext)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(newFilename),
		Body:        file,
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload to S3: %w", err)
	}

	return newFilename, nil
}

// GeneratePresignedURL generates a pre-signed URL for the given S3 object key.
func (s *S3Storage) GeneratePresignedURL(ctx context.Context, objectKey string) (string, error) {
	// If the objectKey is already a full URL (e.g. from seed data like picsum), just return it
	if len(objectKey) > 4 && objectKey[:4] == "http" {
		return objectKey, nil
	}

	req, err := s.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(objectKey),
	}, s3.WithPresignExpires(1*time.Hour))

	if err != nil {
		return "", fmt.Errorf("failed to presign URL: %w", err)
	}

	return req.URL, nil
}
