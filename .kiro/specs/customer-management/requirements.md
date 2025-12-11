# Customer Management System - Requirements Document

## Introduction

The Customer Management System provides administrators with comprehensive tools to manage users, roles, and permissions within the Reliable Drapes e-commerce platform. This system enables admins to view, edit, promote, demote, and delete users while maintaining system security and data integrity.

## Glossary

- **Admin**: A user with elevated privileges who can access the admin dashboard and manage other users
- **Customer**: A standard user who can browse products and place orders
- **Profile**: User information stored in the database including name, role, and company details
- **RLS (Row Level Security)**: Database-level security policies that control data access
- **TDD (Test-Driven Development)**: Development methodology where tests are written before implementation
- **Confirmation Modal**: A dialog that requires explicit user confirmation before executing destructive or important actions

## Requirements

### Requirement 1: View All Users

**User Story:** As an admin, I want to view all registered users in a table format, so that I can see who is using the platform and their current status.

#### Acceptance Criteria

1. WHEN an admin navigates to the customers page THEN the system SHALL display all registered users in a table
2. WHEN the users table is displayed THEN the system SHALL show user name, email, role, and join date for each user
3. WHEN the page loads THEN the system SHALL fetch user data from the database and merge with authentication data
4. WHEN there are no users THEN the system SHALL display a "No users found" message
5. WHEN users are loading THEN the system SHALL display a loading indicator

### Requirement 2: Display User Statistics

**User Story:** As an admin, I want to see statistics about users at a glance, so that I can quickly understand the user base composition.

#### Acceptance Criteria

1. WHEN the customers page loads THEN the system SHALL display total user count
2. WHEN statistics are shown THEN the system SHALL display count of customers and admins separately
3. WHEN user data changes THEN the system SHALL update statistics automatically
4. WHEN statistics fail to load THEN the system SHALL display zero values without crashing

### Requirement 3: Search and Filter Users

**User Story:** As an admin, I want to search and filter users, so that I can quickly find specific users or groups of users.

#### Acceptance Criteria

1. WHEN an admin types in the search box THEN the system SHALL filter users by name or email in real-time
2. WHEN an admin selects a role filter THEN the system SHALL show only users with that role
3. WHEN search query is empty THEN the system SHALL show all users matching the role filter
4. WHEN no users match the filters THEN the system SHALL display "No users found"
5. WHEN filters are cleared THEN the system SHALL restore the full user list
5. WHEN filters are cleared THEN the system SHALL restore the full user list

### Requirement 4: Edit User Information

**User Story:** As an admin, I want to edit user information, so that I can update user details and correct errors.

#### Acceptance Criteria

1. WHEN an admin clicks the edit button THEN the system SHALL open a modal with the user's current information
2. WHEN the edit modal is open THEN the system SHALL allow editing of full name and role
3. WHEN the edit modal is open THEN the system SHALL display email as read-only
4. WHEN an admin submits the edit form THEN the system SHALL show a confirmation modal before updating
5. WHEN the update is confirmed THEN the system SHALL update the user profile in the database
6. WHEN the update succeeds THEN the system SHALL show a success notification and refresh the user list
7. WHEN the update fails THEN the system SHALL show an error notification without closing the modal

### Requirement 5: Promote User to Admin

**User Story:** As an admin, I want to promote users to admin role, so that I can grant them administrative access.

#### Acceptance Criteria

1. WHEN an admin clicks the promote button on a non-admin user THEN the system SHALL show a confirmation dialog
2. WHEN promotion is confirmed THEN the system SHALL update the user's role to "admin" in the database
3. WHEN promotion succeeds THEN the system SHALL show a success notification and update the user list
4. WHEN promotion fails THEN the system SHALL show an error notification
5. WHEN a user is already an admin THEN the system SHALL show a demote button instead of promote

### Requirement 6: Demote Admin to Customer

**User Story:** As an admin, I want to demote other admins to customer role, so that I can revoke administrative access when needed.

#### Acceptance Criteria

1. WHEN an admin clicks the demote button on an admin user THEN the system SHALL show a confirmation dialog
2. WHEN demotion is confirmed THEN the system SHALL update the user's role to "customer" in the database
3. WHEN demotion succeeds THEN the system SHALL show a success notification and update the user list
4. WHEN attempting to demote the last admin THEN the system SHALL prevent the operation and show an error
5. WHEN demotion fails THEN the system SHALL show an error notification

### Requirement 7: Delete User Account

**User Story:** As an admin, I want to delete user accounts, so that I can remove inactive or problematic users from the system.

#### Acceptance Criteria

1. WHEN an admin clicks the delete button THEN the system SHALL show a confirmation dialog with a warning
2. WHEN deletion is confirmed THEN the system SHALL delete the user from the authentication system
3. WHEN a user is deleted THEN the system SHALL cascade delete the user's profile
4. WHEN deletion succeeds THEN the system SHALL show a success notification and update the user list
5. WHEN attempting to delete the last admin THEN the system SHALL prevent the operation and show an error
6. WHEN an admin attempts to delete themselves THEN the system SHALL prevent the operation

### Requirement 8: Confirmation Modals for Important Actions

**User Story:** As an admin, I want to confirm important actions before they execute, so that I can prevent accidental changes.

#### Acceptance Criteria

1. WHEN an admin attempts to delete a user THEN the system SHALL show a confirmation modal with warning text
2. WHEN an admin attempts to promote a user to admin THEN the system SHALL show a confirmation modal
3. WHEN an admin attempts to demote an admin to customer THEN the system SHALL show a confirmation modal
4. WHEN an admin attempts to update user role THEN the system SHALL show a confirmation modal
5. WHEN a confirmation modal is shown THEN the system SHALL require explicit confirmation before proceeding
6. WHEN a confirmation is cancelled THEN the system SHALL abort the action without changes

### Requirement 9: Prevent Last Admin Removal

**User Story:** As a system administrator, I want to prevent the last admin from being deleted or demoted, so that administrative access to the system is never lost.

#### Acceptance Criteria

1. WHEN attempting to delete the last admin THEN the system SHALL prevent the deletion at the database level
2. WHEN attempting to demote the last admin THEN the system SHALL prevent the demotion at the database level
3. WHEN the last admin protection triggers THEN the system SHALL return a clear error message
4. WHEN there are multiple admins THEN the system SHALL allow deletion or demotion of any admin except themselves
5. WHEN the last admin tries to delete themselves THEN the system SHALL prevent the operation

### Requirement 10: Role-Based Access Control

**User Story:** As a system architect, I want role-based access control enforced at the database level, so that security cannot be bypassed through the application layer.

#### Acceptance Criteria

1. WHEN a non-admin user attempts to view all profiles THEN the database SHALL deny access
2. WHEN a non-admin user attempts to update another user's profile THEN the database SHALL deny access
3. WHEN an admin user queries profiles THEN the database SHALL allow access to all profiles
4. WHEN an admin user updates a profile THEN the database SHALL allow the update
5. WHEN any user queries their own profile THEN the database SHALL allow access

### Requirement 11: Display Relative Time

**User Story:** As an admin, I want to see when users joined in relative time format, so that I can quickly understand user account age.

#### Acceptance Criteria

1. WHEN displaying user join date THEN the system SHALL show relative time (e.g., "2 days ago")
2. WHEN a user joined today THEN the system SHALL display "today" or "X hours ago"
3. WHEN a user joined within the last week THEN the system SHALL display "X days ago"
4. WHEN a user joined more than a week ago THEN the system SHALL display "X weeks ago" or "X months ago"
5. WHEN join date is invalid THEN the system SHALL display a fallback message

### Requirement 12: Visual Role Indicators

**User Story:** As an admin, I want to see visual indicators for user roles, so that I can quickly identify user types at a glance.

#### Acceptance Criteria

1. WHEN displaying user roles THEN the system SHALL use color-coded badges
2. WHEN a user is an admin THEN the system SHALL display a purple badge
3. WHEN a user is a customer THEN the system SHALL display a gray badge
4. WHEN hovering over a role badge THEN the system SHALL maintain consistent styling
5. WHEN the table is displayed THEN the system SHALL show role badges clearly for all users

### Requirement 13: Toast Notifications

**User Story:** As an admin, I want to receive feedback notifications for all actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. WHEN any user management action completes THEN the system SHALL display a toast notification
2. WHEN an action succeeds THEN the system SHALL display a success toast with green styling
3. WHEN an action fails THEN the system SHALL display an error toast with red styling
4. WHEN a toast is displayed THEN the system SHALL auto-dismiss it after 3 seconds
5. WHEN multiple actions occur THEN the system SHALL stack toast notifications

### Requirement 14: Responsive Design

**User Story:** As an admin, I want the customer management interface to work on all devices, so that I can manage users from anywhere.

#### Acceptance Criteria

1. WHEN viewing on desktop THEN the system SHALL display the full table with all columns
2. WHEN viewing on tablet THEN the system SHALL adjust layout to fit smaller screens
3. WHEN viewing on mobile THEN the system SHALL make the table horizontally scrollable
4. WHEN the edit modal is opened on mobile THEN the system SHALL display it full-screen
5. WHEN statistics cards are viewed on mobile THEN the system SHALL stack them vertically

### Requirement 15: Data Validation

**User Story:** As a system architect, I want all user data to be validated, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN updating a user THEN the system SHALL validate that role is one of: customer, admin
2. WHEN submitting the edit form THEN the system SHALL prevent submission if required fields are empty
3. WHEN an invalid role is provided THEN the system SHALL reject the update and show an error
4. WHEN database constraints are violated THEN the system SHALL handle the error gracefully
5. WHEN full name is empty THEN the system SHALL allow it (optional field)

---

## Testing Strategy

### Unit Tests
- Test each server action independently
- Mock Supabase client responses
- Test error handling paths
- Test data transformation functions
- Test validation logic

### Integration Tests
- Test complete user management workflows
- Test database policies with real Supabase instance
- Test cascade deletions
- Test last admin protection triggers
- Test role-based access control

### Property-Based Tests
- Test that search always returns subset of all users
- Test that filters are idempotent
- Test that role changes are reversible
- Test that statistics always sum correctly
- Test that relative time formatting is consistent

### Component Tests
- Test table rendering with various data states
- Test modal open/close behavior
- Test form submission
- Test search and filter interactions
- Test toast notifications

---

## Non-Functional Requirements

### Performance
- User list should load within 2 seconds
- Search should filter in real-time (< 100ms)
- Statistics should calculate in < 500ms
- Modal should open/close smoothly (< 300ms)

### Security
- All admin actions must verify role server-side
- Database policies must enforce access control
- Sensitive operations require confirmation
- Last admin protection must be foolproof

### Usability
- Interface should be intuitive without training
- Actions should have clear visual feedback
- Errors should provide actionable messages
- Confirmations should prevent accidental actions

### Maintainability
- Code should follow TypeScript best practices
- Functions should be small and focused
- Types should be well-defined
- Tests should cover all critical paths

---

**Document Version:** 1.0  
**Last Updated:** December 10, 2024  
**Status:** Approved
