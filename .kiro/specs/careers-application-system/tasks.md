# Implementation Plan - Careers Application System

- [ ] 1. Set up database schema and storage

- [ ] 1.1 Create applications table migration
  - Create table with all required fields
  - Add indexes for performance
  - _Requirements: 2.2_

- [ ] 1.2 Create RLS policies for applications
  - Admin read/update policies
  - Public insert policy
  - _Requirements: 3.1, 4.1_

- [ ] 1.3 Create Supabase Storage bucket for resumes
  - Create 'resumes' bucket
  - Configure storage policies
  - Set file size and type restrictions
  - _Requirements: 1.2_

- [ ] 2. Implement file upload service
- [ ] 2.1 Create file validation utilities
  - Validate file size (max 5MB)
  - Validate file type (PDF, DOC, DOCX)
  - Validate file extension
  - _Requirements: 1.1, 1.5_

- [ ] 2.2 Write property test for file validation
  - **Property 1: File validation consistency**
  - **Validates: Requirements 1.1, 1.5**

- [ ] 2.3 Create file upload service
  - Implement uploadResume function
  - Generate unique filenames
  - Handle upload progress
  - Return file URL and path
  - _Requirements: 1.2, 1.3_

- [ ] 2.4 Write property test for upload-store consistency
  - **Property 2: Upload-store consistency**
  - **Validates: Requirements 1.2**

- [ ] 2.5 Implement error handling for uploads
  - Handle network errors
  - Handle file size errors
  - Handle invalid file type errors
  - _Requirements: 1.4_

- [ ] 3. Create application submission actions
- [ ] 3.1 Create submitApplication server action
  - Validate form data
  - Upload resume file
  - Save application to database
  - Handle transaction rollback on failure
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Write property test for submission atomicity
  - **Property 3: Application submission atomicity**
  - **Validates: Requirements 2.2**

- [ ] 3.3 Create getAllApplications server action
  - Fetch all applications with admin check
  - Join with jobs table for position details
  - Order by submission date
  - _Requirements: 3.1, 3.2_

- [ ] 3.4 Create updateApplicationStatus server action
  - Validate status value
  - Update application status
  - Record timestamp
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3.5 Write property test for status transitions
  - **Property 4: Status transition validity**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 3.6 Create getResumeDownloadUrl server action
  - Generate signed URL for resume
  - Set expiration time (1 hour)
  - _Requirements: 3.4_

- [ ] 3.7 Write property test for admin access control
  - **Property 5: Admin access control**
  - **Validates: Requirements 3.1, 4.1**

- [ ] 4. Update JobApplicationModal component
- [ ] 4.1 Add file upload UI to modal
  - Add file input with drag-and-drop
  - Display selected file name
  - Show file size
  - Add remove file button
  - _Requirements: 1.1_

- [ ] 4.2 Implement file upload progress indicator
  - Show upload progress bar
  - Display percentage
  - Show success indicator
  - _Requirements: 1.3_

- [ ] 4.3 Add form validation
  - Validate required fields
  - Validate email format
  - Validate phone format
  - Validate file selection
  - _Requirements: 2.1, 1.5_

- [ ] 4.4 Implement form submission
  - Call submitApplication action
  - Handle loading state
  - Show success message
  - Handle errors and preserve form data
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 4.5 Add error handling UI
  - Display validation errors inline
  - Show upload error messages
  - Show submission error messages
  - _Requirements: 1.4, 2.4_

- [ ] 5. Create admin applications page
- [ ] 5.1 Create applications page route
  - Create /admin/applications page
  - Add to admin navigation
  - _Requirements: 3.1_

- [ ] 5.2 Create applications table component
  - Display all applications
  - Show applicant details
  - Show position and status
  - Show submission date
  - _Requirements: 3.2_

- [ ] 5.3 Add filtering functionality
  - Filter by position
  - Filter by status
  - Add search by name/email
  - _Requirements: 3.5_

- [ ] 5.4 Implement status update UI
  - Add status dropdown
  - Handle status change
  - Show confirmation
  - Update UI optimistically
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 5.5 Add resume download functionality
  - Add download button
  - Generate signed URL
  - Trigger download
  - Handle download errors
  - _Requirements: 3.4_

- [ ] 5.6 Write property test for resume download
  - **Property 6: Resume download availability**
  - **Validates: Requirements 3.4**

- [ ] 5.7 Create application details modal
  - Show full application details
  - Display cover letter
  - Show resume preview/download
  - Add status update controls
  - _Requirements: 3.3_

- [ ] 6. Add loading states and skeletons
- [ ] 6.1 Create ApplicationsTableSkeleton component
  - Match table layout
  - Animate loading state
  - _Requirements: 3.1_

- [ ] 6.2 Add loading states to modal
  - Show spinner during upload
  - Show spinner during submission
  - Disable form during loading
  - _Requirements: 2.2_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
