# Requirements Document

## Introduction

This document outlines the requirements for improving the e-catalogue PDF preview modal UI/UX, including loading states, error handling, and better visual design.

## Glossary

- **Preview Modal**: The overlay dialog that displays catalogue PDF previews
- **Loading State**: Visual indicator shown while PDF content is being loaded
- **Catalogue System**: The e-catalogue browsing and download functionality
- **PDF Viewer**: The embedded component that displays PDF files

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a loading indicator while the PDF loads, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. WHEN a user opens a catalogue preview THEN the system SHALL display a loading spinner immediately
2. WHILE the PDF is loading THEN the system SHALL show a loading progress indicator
3. WHEN the PDF finishes loading THEN the system SHALL hide the loading indicator and display the PDF
4. WHEN the PDF takes longer than 5 seconds THEN the system SHALL display a "Still loading..." message
5. THE loading indicator SHALL be visually centered and clearly visible

### Requirement 2

**User Story:** As a user, I want to see a helpful message if the PDF fails to load, so that I understand what went wrong and what I can do.

#### Acceptance Criteria

1. WHEN a PDF fails to load THEN the system SHALL display a user-friendly error message
2. WHEN an error occurs THEN the system SHALL provide options to retry or download directly
3. WHEN the PDF URL is invalid THEN the system SHALL display a "Preview unavailable" message
4. THE error message SHALL include a download button as an alternative
5. THE system SHALL log technical errors for debugging while showing user-friendly messages

### Requirement 3

**User Story:** As a user, I want an improved modal design, so that I have a better viewing experience.

#### Acceptance Criteria

1. THE modal SHALL have smooth fade-in and scale animations when opening
2. THE modal SHALL have a clean, modern design with proper spacing and typography
3. THE PDF viewer SHALL fill the available space efficiently without awkward gaps
4. THE modal SHALL have clear, accessible close and download buttons
5. THE modal SHALL be responsive and work well on mobile, tablet, and desktop screens

### Requirement 4

**User Story:** As a user, I want to easily download the catalogue, so that I can view it offline or save it for later.

#### Acceptance Criteria

1. WHEN a user clicks the download button THEN the system SHALL initiate the file download
2. WHEN download starts THEN the system SHALL show a toast notification confirming the download
3. THE download button SHALL be prominently displayed and clearly labeled
4. THE download button SHALL remain accessible even if the PDF preview fails
5. THE system SHALL track download counts for analytics

### Requirement 5

**User Story:** As a user, I want the modal to be keyboard accessible, so that I can navigate without a mouse.

#### Acceptance Criteria

1. WHEN the modal is open THEN the system SHALL trap focus within the modal
2. WHEN a user presses Escape THEN the system SHALL close the modal
3. WHEN a user tabs through elements THEN the system SHALL follow a logical focus order
4. THE close and download buttons SHALL be keyboard accessible
5. THE system SHALL provide visual focus indicators for keyboard navigation
