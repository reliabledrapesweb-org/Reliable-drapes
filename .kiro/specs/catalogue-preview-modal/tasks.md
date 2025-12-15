# Implementation Plan - Catalogue Preview Modal

- [ ] 1. Create loading state components




- [x] 1.1 Create LoadingSpinner component


  - Animated spinner with smooth rotation
  - Configurable size and color
  - _Requirements: 1.1_

- [x] 1.2 Create LoadingProgress component


  - Progress bar with percentage
  - Phase indicators (initializing, fetching, rendering)
  - Smooth animation transitions
  - _Requirements: 1.2_

- [ ] 1.3 Write property test for loading indicator visibility


  - **Property 1: Loading indicator visibility**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 1.4 Create SlowLoadingMessage component

  - Display after 5 second threshold
  - Friendly "Still loading..." message
  - _Requirements: 1.4_

- [ ] 1.5 Write property test for slow loading message timing

  - **Property 2: Slow loading message timing**
  - **Validates: Requirements 1.4**

- [ ] 2. Create error state components
- [ ] 2.1 Create ErrorDisplay component
  - Error icon
  - User-friendly error message
  - Retry and download buttons
  - _Requirements: 2.1, 2.2_

- [ ] 2.2 Implement error message mapping
  - Map technical errors to user-friendly messages
  - Network error messages
  - Not found error messages
  - Timeout error messages
  - _Requirements: 2.1, 2.3_

- [ ] 2.3 Write property test for error state completeness
  - **Property 3: Error state completeness**
  - **Validates: Requirements 2.1, 2.2, 2.4**

- [ ] 2.4 Add retry functionality
  - Retry button handler
  - Reset loading state
  - Attempt reload
  - _Requirements: 2.2_

- [ ] 3. Refactor ProductCard modal
- [ ] 3.1 Extract modal into separate component
  - Create CataloguePreviewModal component
  - Move modal logic from ProductCard
  - Clean up ProductCard component
  - _Requirements: 3.1_

- [ ] 3.2 Implement loading state management
  - Track loading phases
  - Manage loading progress
  - Handle slow loading detection
  - _Requirements: 1.2, 1.4_

- [ ] 3.3 Implement error state management
  - Detect iframe load errors
  - Detect network errors
  - Detect timeout errors
  - Set appropriate error messages
  - _Requirements: 2.1, 2.3_

- [ ] 3.4 Add PDF load detection
  - Listen to iframe onload event
  - Listen to iframe onerror event
  - Implement timeout detection (30s)
  - _Requirements: 1.3, 2.3_

- [ ] 4. Improve modal UI/UX
- [ ] 4.1 Update modal animations
  - Smooth fade-in animation
  - Scale animation on open
  - Slide-up animation
  - Smooth exit animation
  - _Requirements: 3.1_

- [ ] 4.2 Write property test for animation consistency
  - **Property 6: Animation consistency**
  - **Validates: Requirements 3.1**

- [ ] 4.3 Improve modal layout
  - Better spacing and padding
  - Responsive sizing
  - Proper content hierarchy
  - _Requirements: 3.2, 3.3_

- [ ] 4.4 Style action buttons
  - Prominent download button
  - Clear close button
  - Proper button states (hover, active, disabled)
  - _Requirements: 3.4, 4.1_

- [ ] 4.5 Optimize PDF viewer layout
  - Fill available space efficiently
  - Remove awkward gaps
  - Proper aspect ratio handling
  - _Requirements: 3.3_

- [ ] 5. Implement download functionality
- [ ] 5.1 Improve download button visibility
  - Make button prominent
  - Add download icon
  - Clear labeling
  - _Requirements: 4.3_

- [ ] 5.2 Add download confirmation toast
  - Show toast on download start
  - Display catalogue name
  - Auto-dismiss after 3 seconds
  - _Requirements: 4.2_

- [ ] 5.3 Ensure download works in all states
  - Available during loading
  - Available on error
  - Available when loaded
  - _Requirements: 4.4_

- [ ] 5.4 Write property test for download availability
  - **Property 4: Download availability**
  - **Validates: Requirements 2.4, 4.4**

- [ ] 6. Implement keyboard accessibility
- [ ] 6.1 Add Escape key handler
  - Close modal on Escape press
  - Clean up event listeners
  - _Requirements: 5.2_

- [ ] 6.2 Implement focus trap
  - Trap focus within modal
  - Handle Tab navigation
  - Handle Shift+Tab navigation
  - _Requirements: 5.1, 5.3_

- [ ] 6.3 Write property test for keyboard navigation
  - **Property 5: Keyboard navigation**
  - **Validates: Requirements 5.1, 5.2**

- [ ] 6.4 Add focus indicators
  - Visible focus rings
  - High contrast support
  - Keyboard-only focus indicators
  - _Requirements: 5.5_

- [ ] 6.5 Add ARIA labels
  - Label modal dialog
  - Label close button
  - Label download button
  - Announce loading/error states
  - _Requirements: 5.3, 5.4_

- [ ] 7. Add responsive design
- [ ] 7.1 Implement mobile layout
  - Full-screen modal on mobile
  - Touch-friendly buttons
  - Proper spacing for small screens
  - _Requirements: 3.5_

- [ ] 7.2 Implement tablet layout
  - Optimized modal size
  - Proper button sizing
  - Good use of space
  - _Requirements: 3.5_

- [ ] 7.3 Implement desktop layout
  - Large modal with max width
  - Optimal PDF viewing size
  - Proper spacing
  - _Requirements: 3.5_

- [ ] 8. Performance optimizations
- [ ] 8.1 Implement lazy PDF loading
  - Only load PDF when modal opens
  - Cancel loading on modal close
  - _Requirements: 1.3_

- [ ] 8.2 Add loading progress simulation
  - Simulate progress through phases
  - Smooth progress animation
  - Realistic timing
  - _Requirements: 1.2_

- [ ] 8.3 Optimize animations
  - Use CSS transforms
  - Use GPU acceleration
  - Avoid layout thrashing
  - _Requirements: 3.1_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
