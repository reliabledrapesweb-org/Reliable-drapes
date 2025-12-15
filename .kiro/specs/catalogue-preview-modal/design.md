# Design Document - Catalogue Preview Modal

## Overview

This design document outlines the technical implementation for improving the e-catalogue PDF preview modal with better loading states, error handling, and overall UI/UX enhancements.

## Architecture

### Component Structure

```
ProductCard
    │
    ├─> onClick: setShowPreview(true)
    │
    └─> CataloguePreviewModal
            │
            ├─> LoadingState
            ├─> ErrorState
            ├─> PDFViewer
            └─> ActionButtons
```

## Components and Interfaces

### 1. CataloguePreviewModal Component

```typescript
interface CataloguePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogue: {
    id: string;
    title: string;
    subtitle: string;
    pdfUrl?: string;
    imageSrc: string;
  };
  onDownload: (catalogueName: string, catalogueId: string) => void;
}

interface ModalState {
  loadingState: 'idle' | 'loading' | 'loaded' | 'error';
  error: string | null;
  loadingProgress: number;
  showSlowLoadingMessage: boolean;
}
```

### 2. Loading States

```typescript
interface LoadingStateProps {
  progress: number;
  showSlowMessage: boolean;
}

// Loading phases
type LoadingPhase = 
  | 'initializing'    // 0-25%
  | 'fetching'        // 25-50%
  | 'rendering'       // 50-75%
  | 'finalizing';     // 75-100%
```

### 3. Error States

```typescript
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onDownload: () => void;
  catalogueTitle: string;
}

type ErrorType =
  | 'network'         // Network connection failed
  | 'not_found'       // PDF URL is invalid/not found
  | 'timeout'         // Loading took too long
  | 'unsupported'     // Browser doesn't support PDF viewing
  | 'unknown';        // Generic error
```

## Data Models

### Modal Animation States

```typescript
interface AnimationConfig {
  initial: {
    opacity: 0;
    scale: 0.95;
    y: 20;
  };
  animate: {
    opacity: 1;
    scale: 1;
    y: 0;
  };
  exit: {
    opacity: 0;
    scale: 0.95;
    y: 20;
  };
  transition: {
    duration: 0.3;
    ease: [0.22, 1, 0.36, 1];
  };
}
```

### Loading Progress Tracking

```typescript
interface LoadingTracker {
  startTime: number;
  currentPhase: LoadingPhase;
  estimatedProgress: number;
  showSlowWarning: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Loading indicator visibility
*For any* modal open event, a loading indicator must be displayed immediately until the PDF loads or an error occurs
**Validates: Requirements 1.1, 1.2**

### Property 2: Slow loading message timing
*For any* PDF that takes longer than 5 seconds to load, a "Still loading..." message must be displayed
**Validates: Requirements 1.4**

### Property 3: Error state completeness
*For any* error that occurs, the error state must display a message AND provide retry/download options
**Validates: Requirements 2.1, 2.2, 2.4**

### Property 4: Download availability
*For any* modal state (loading, error, or loaded), the download button must remain accessible and functional
**Validates: Requirements 2.4, 4.4**

### Property 5: Keyboard navigation
*For any* modal open state, pressing Escape must close the modal AND focus must be trapped within the modal
**Validates: Requirements 5.1, 5.2**

### Property 6: Animation consistency
*For any* modal open/close action, animations must complete before state changes are finalized
**Validates: Requirements 3.1**

## Error Handling

### PDF Loading Errors

**Network Error:**
```typescript
{
  title: "Connection Error",
  message: "Unable to load the PDF. Please check your internet connection.",
  actions: ["Retry", "Download Instead"]
}
```

**Not Found Error:**
```typescript
{
  title: "Preview Unavailable",
  message: "The PDF preview is currently unavailable.",
  actions: ["Download Catalogue"]
}
```

**Timeout Error:**
```typescript
{
  title: "Loading Timeout",
  message: "The PDF is taking longer than expected to load.",
  actions: ["Keep Waiting", "Download Instead"]
}
```

**Browser Unsupported:**
```typescript
{
  title: "Preview Not Supported",
  message: "Your browser doesn't support PDF preview. Please download to view.",
  actions: ["Download Catalogue"]
}
```

### Error Recovery Strategies

1. **Automatic Retry**: Retry once automatically on network errors
2. **Fallback to Image**: Show catalogue image if PDF fails
3. **Direct Download**: Always provide download option
4. **Error Logging**: Log errors for debugging without exposing to user

## UI/UX Design

### Loading State Design

```
┌─────────────────────────────────────┐
│  [X]  Catalogue Name                │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │   Spinner   │             │
│         └─────────────┘             │
│                                     │
│      Loading catalogue...           │
│      [Progress Bar: 45%]            │
│                                     │
│   (After 5s: "Still loading...")    │
│                                     │
├─────────────────────────────────────┤
│         [Close] [Download]          │
└─────────────────────────────────────┘
```

### Error State Design

```
┌─────────────────────────────────────┐
│  [X]  Catalogue Name                │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │   ⚠️ Icon   │             │
│         └─────────────┘             │
│                                     │
│      Preview Unavailable            │
│   The PDF couldn't be loaded        │
│                                     │
│      [Retry] [Download]             │
│                                     │
├─────────────────────────────────────┤
│         [Close] [Download]          │
└─────────────────────────────────────┘
```

### Loaded State Design

```
┌─────────────────────────────────────┐
│  [X]  Catalogue Name                │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │     PDF Content         │     │
│    │     (Full Height)       │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│         [Close] [Download]          │
└─────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- Loading state transitions
- Error message generation
- Progress calculation
- Keyboard event handlers
- Animation timing

### Property-Based Tests
- **Property 1 Test**: Open modal with various PDF URLs, verify loading indicator appears immediately
- **Property 2 Test**: Simulate slow loading (>5s), verify slow message appears
- **Property 3 Test**: Generate various error scenarios, verify error state completeness
- **Property 4 Test**: Test download button in all modal states, verify always functional
- **Property 5 Test**: Test keyboard navigation in various states, verify Escape closes and focus trap works
- **Property 6 Test**: Trigger rapid open/close actions, verify animations complete properly

### Integration Tests
- Complete modal lifecycle (open → load → close)
- Error recovery flow (error → retry → success)
- Download flow from all states
- Keyboard navigation flow

## Implementation Details

### Loading Progress Simulation

Since iframe loading doesn't provide real progress, we'll simulate it:

```typescript
const simulateProgress = () => {
  const phases = [
    { duration: 1000, progress: 25 },   // Initializing
    { duration: 2000, progress: 50 },   // Fetching
    { duration: 1500, progress: 75 },   // Rendering
    { duration: 500, progress: 95 },    // Finalizing
  ];
  
  // Animate through phases
  // Show "Still loading..." after 5 seconds
};
```

### Iframe Load Detection

```typescript
const handleIframeLoad = () => {
  iframe.onload = () => {
    setLoadingState('loaded');
    clearTimeout(slowLoadingTimer);
  };
  
  iframe.onerror = () => {
    setLoadingState('error');
    setError('Failed to load PDF');
  };
  
  // Timeout after 30 seconds
  setTimeout(() => {
    if (loadingState === 'loading') {
      setLoadingState('error');
      setError('Loading timeout');
    }
  }, 30000);
};
```

### Keyboard Accessibility

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    onClose();
  }
  
  // Trap focus within modal
  if (e.key === 'Tab') {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
};
```

### Responsive Design

```typescript
const responsiveConfig = {
  mobile: {
    modalHeight: '100vh',
    modalWidth: '100vw',
    borderRadius: '0',
    padding: '1rem',
  },
  tablet: {
    modalHeight: '90vh',
    modalWidth: '90vw',
    borderRadius: '1rem',
    padding: '1.5rem',
  },
  desktop: {
    modalHeight: '90vh',
    modalWidth: '1200px',
    borderRadius: '1.5rem',
    padding: '2rem',
  },
};
```

## Performance Optimizations

1. **Lazy Load PDF**: Only load PDF when modal opens
2. **Preload Next Catalogue**: Preload PDF of next catalogue in grid
3. **Cache Loaded PDFs**: Keep loaded PDFs in memory for quick re-opening
4. **Debounce Resize**: Debounce window resize events for responsive adjustments
5. **Optimize Animations**: Use CSS transforms for better performance

## Accessibility Features

- **ARIA Labels**: Proper labels for all interactive elements
- **Focus Management**: Auto-focus close button on open
- **Screen Reader Announcements**: Announce loading/error states
- **High Contrast Support**: Ensure visibility in high contrast mode
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear visual focus indicators
