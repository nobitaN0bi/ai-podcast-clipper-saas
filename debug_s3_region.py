
import boto3
import os

try:
    s3_client = boto3.client("s3")
    bucket = "kriyam-podcast-clipper"
    print(f"Checking location for bucket: {bucket}")
    
    # Get the bucket location
    response = s3_client.get_bucket_location(Bucket=bucket)
    location = response['LocationConstraint']
    
    # If None, it means us-east-1 (N. Virginia)
    if location is None:
        location = "us-east-1"
        
    print(f"SUCCESS: The bucket '{bucket}' is located in: {location}")
    
except Exception as e:
    print(f"ERROR: Could not get bucket location. Details: {e}")
