# Design Document - Careers Application System

## Overview

This design document outlines the technical implementation for a complete job application system including resume upload to Supabase Storage, application submission, and admin dashboard integration.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Careers Page   │
│   (Frontend)    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│ Application     │  │  File Upload     │
│   Actions       │  │   Service        │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│   Supabase      │  │    Supabase      │
│   Database      │  │    Storage       │
└─────────────────┘  └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Admin Dashboard │
│  Applications   │
└─────────────────┘
```

## Components and Interfaces

### 1. Database Schema

**applications table:**
```typescript
interface Application {
  id: string;                    // UUID primary key
  full_name: string;             // Applicant name
  email: string;                 // Applicant email
  phone: string;                 // Applicant phone
  position: string;              // Job position applied for
  job_id: string;                // Foreign key to jobs table
  resume_url: string;            // URL to resume in Supabase Storage
  resume_filename: string;       // Original filename
  cover_letter?: string;         // Optional cover letter text
  status: ApplicationStatus;     // Application status
  created_at: timestamp;         // Submission timestamp
  updated_at: timestamp;         // Last update timestamp
}

type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
```

### 2. Supabase Storage Bucket

**Bucket Configuration:**
- Bucket name: `resumes`
- Public access: No (private)
- File size limit: 5MB
- Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Path structure: `{year}/{month}/{uuid}-{filename}`

### 3. File Upload Service

```typescript
interface FileUploadService {
  uploadResume(file: File, applicantEmail: string): Promise<UploadResult>;
  deleteResume(filePath: string): Promise<void>;
  getResumeUrl(filePath: string): Promise<string>;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}
```

### 4. Application Actions

```typescript
interface ApplicationActions {
  submitApplication(data: ApplicationInput): Promise<ActionResult>;
  getAllApplications(): Promise<ActionResult<Application[]>>;
  getApplicationById(id: string): Promise<ActionResult<Application>>;
  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<ActionResult>;
  deleteApplication(id: string): Promise<ActionResult>;
}

interface ApplicationInput {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  job_id: string;
  resume_file: File;
  cover_letter?: string;
}
```

### 5. Frontend Components

**JobApplicationModal:**
- Form with validation
- File upload with drag-and-drop
- Progress indicators
- Success/error states

**AdminApplicationsPage:**
- Applications table with filtering
- Status management
- Resume download
- Application details view

## Data Models

### Application Form Data

```typescript
interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  resume: File | null;
  cover_letter: string;
}

interface ApplicationFormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  resume?: string;
  cover_letter?: string;
}
```

### File Validation

```typescript
interface FileValidation {
  maxSize: 5 * 1024 * 1024; // 5MB
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  allowedExtensions: ['.pdf', '.doc', '.docx'];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File validation consistency
*For any* uploaded file, if the file passes validation, then it must be within size limits AND have an allowed file type
**Validates: Requirements 1.1, 1.5**

### Property 2: Upload-store consistency
*For any* successful file upload, the file must exist in Supabase Storage AND the URL must be accessible
**Validates: Requirements 1.2**

### Property 3: Application submission atomicity
*For any* application submission, either ALL data (form + file) is saved successfully OR nothing is saved (rollback)
**Validates: Requirements 2.2**

### Property 4: Status transition validity
*For any* status update, the new status must be one of the valid ApplicationStatus values
**Validates: Requirements 4.1, 4.2**

### Property 5: Admin access control
*For any* admin operation (view/update/delete), the current user must have admin role
**Validates: Requirements 3.1, 4.1**

### Property 6: Resume download availability
*For any* application with a resume_url, downloading the resume must return the original file
**Validates: Requirements 3.4**

## Error Handling

### File Upload Errors
- **File too large**: Display "File size must be under 5MB"
- **Invalid file type**: Display "Only PDF, DOC, and DOCX files are allowed"
- **Upload failed**: Display "Upload failed. Please try again" with retry option
- **Network error**: Display "Network error. Check your connection"

### Form Validation Errors
- **Missing required fields**: Highlight fields and show inline errors
- **Invalid email**: "Please enter a valid email address"
- **Invalid phone**: "Please enter a valid phone number"
- **No resume**: "Please upload your resume"

### Database Errors
- **Duplicate application**: "You have already applied for this position"
- **Job not found**: "This job posting is no longer available"
- **Save failed**: "Failed to submit application. Please try again"

### Admin Dashboard Errors
- **Load failed**: Display error message with retry button
- **Update failed**: Show toast notification with error
- **Download failed**: "Failed to download resume. Please try again"

## Testing Strategy

### Unit Tests
- File validation logic (size, type, extension)
- Form validation rules
- URL generation for storage paths
- Status transition logic

### Property-Based Tests
- **Property 1 Test**: Generate random files with various sizes and types, verify validation consistency
- **Property 2 Test**: Upload random valid files, verify storage existence and URL accessibility
- **Property 3 Test**: Submit applications with various data combinations, verify atomicity
- **Property 4 Test**: Generate random status transitions, verify only valid statuses are accepted
- **Property 5 Test**: Attempt admin operations with various user roles, verify access control
- **Property 6 Test**: Create applications with resumes, verify download returns original file

### Integration Tests
- Complete application submission flow
- File upload to Supabase Storage
- Admin dashboard data fetching
- Status update workflow

## Implementation Notes

### File Upload Flow
1. User selects file
2. Validate file client-side (size, type)
3. Generate unique filename with UUID
4. Upload to Supabase Storage
5. Get public/signed URL
6. Store URL in database with application

### Security Considerations
- Use signed URLs for resume downloads (expires after 1 hour)
- Validate file types on both client and server
- Sanitize filenames to prevent path traversal
- Implement rate limiting on uploads
- Use RLS policies for database access

### Performance Optimizations
- Compress large files before upload
- Use multipart upload for files > 1MB
- Implement upload progress tracking
- Cache application list in admin dashboard
- Paginate applications list (20 per page)

## Database Migrations

### Migration 1: Create applications table
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  resume_filename TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview', 'rejected', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
```

### Migration 2: Create RLS policies
```sql
-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Anyone can insert applications (public form)
CREATE POLICY "Anyone can submit applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### Migration 3: Create storage bucket
```sql
-- Create resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload resumes"
  ON storage.objects FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'resumes');

-- Admins can read all resumes
CREATE POLICY "Admins can read resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND is_admin(auth.uid()));
```
