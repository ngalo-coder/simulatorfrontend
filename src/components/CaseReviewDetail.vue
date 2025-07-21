<template>
  <div class="case-review-detail">
    <!-- Case Header -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ caseData.caseData.case_metadata.title }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ caseData.caseData.case_metadata.specialty }}
            <span v-if="caseData.caseData.case_metadata.module">
              • {{ caseData.caseData.case_metadata.module }}
            </span>
            • {{ caseData.caseData.case_metadata.difficulty }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Case ID: {{ caseData.caseData.case_metadata.case_id }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900">
            {{ caseData.contributorName }}
          </div>
          <div class="text-sm text-gray-500">
            {{ caseData.contributorEmail }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            Submitted: {{ formatDate(caseData.submittedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Contributor Performance -->
    <div v-if="caseData.contributorPerformance" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h4 class="text-md font-semibold text-blue-900 mb-2">Contributor Performance</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-blue-700 font-medium">Total Cases:</span>
          <span class="ml-1">{{ caseData.contributorPerformance.totalCases }}</span>
        </div>
        <div>
          <span class="text-blue-700 font-medium">Excellent:</span>
          <span class="ml-1">{{ caseData.contributorPerformance.excellentCount }}</span>
        </div>
        <div>
          <span class="text-blue-700 font-medium">Avg Rating:</span>
          <span class="ml-1">{{ caseData.contributorPerformance.averageRating.toFixed(1) }}</span>
        </div>
        <div>
          <span class="text-blue-700 font-medium">Approv