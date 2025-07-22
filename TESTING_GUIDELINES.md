```json
{
  "test_execution_instructions": {
    "prerequisites": {
      "backend": [
        "MongoDB running and accessible",
        "Node.js environment set up",
        "Environment variables configured",
        "Email service credentials (optional for testing)"
      ],
      "frontend": [
        "Vue.js development environment",
        "Node.js and npm installed",
        "Backend API running",
        "Browser with developer tools"
      ]
    },
    "execution_order": [
      "1. Set up backend environment",
      "2. Run backend API tests",
      "3. Verify database operations",
      "4. Set up frontend environment",
      "5. Run frontend component tests",
      "6. Execute end-to-end workflow tests",
      "7. Perform cross-browser testing",
      "8. Document results and issues"
    ],
    "reporting": {
      "test_results_format": {
        "test_name": "string",
        "status": "pass|fail|skip",
        "execution_time": "number (ms)",
        "error_message": "string (if failed)",
        "screenshots": "array of file paths",
        "notes": "string"
      },
      "summary_metrics": [
        "Total tests executed",
        "Pass rate percentage",
        "Critical issues found",
        "Performance benchmarks",
        "Browser compatibility status"
      ]
    }
  }
}
```
