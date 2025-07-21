<template>
  <div class="performance-dashboard">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
        <p class="text-gray-600">
          Track your clinical performance and case contribution eligibility.
        </p>
      </div>

      <!-- Overall Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Cases</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.overallStats?.totalEvaluations || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Excellent Ratings</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.overallStats?.excellentCount || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Excellence Rate</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.overallStats?.excellentRate || 0 }}%</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div :class="[
              'p-2 rounded-lg',
              summary.contributorStatus?.isEligible ? 'bg-green-100' : 'bg-gray-100'
            ]">
              <svg :class="[
                'w-6 h-6',
                summary.contributorStatus?.isEligible ? 'text-green-600' : 'text-gray-600'
              ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Contributor Status</p>
              <p :class="[
                'text-2xl font-bold',
                summary.contributorStatus?.isEligible ? 'text-green-600' : 'text-gray-600'
              ]">
                {{ summary.contributorStatus?.isEligible ? 'Eligible' : 'Not Eligible' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contributor Eligibility Section -->
      <div v-if="summary.contributorStatus?.isEligible" class="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="text-lg font-semibold text-green-800">🎉 Congratulations! You're eligible to contribute cases</h2>
        </div>
        <p class="text-green-700 mb-4">
          You can now contribute new cases in the following specialties:
        </p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="specialty in summary.contributorStatus.eligibleSpecialties" :key="specialty"
                class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {{ specialty }}
          </span>
        </div>
        <router-link
          to="/contribute/new"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Start Contributing Cases
        </router-link>
      </div>

      <!-- Specialty Performance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Specialty Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Performance by Specialty</h2>
          </div>
          <div class="p-6">
            <div v-if="Object.keys(summary.specialtyStats || {}).length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No performance data yet</h3>
              <p class="mt-1 text-sm text-gray-500">Complete some case evaluations to see your performance.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(stats, specialty) in summary.specialtyStats" :key="specialty" 
                   class="p-4 border border-gray-200 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium text-gray-900">{{ specialty }}</h3>
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    summary.contributorStatus?.eligibleSpecialties?.includes(specialty)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ summary.contributorStatus?.eligibleSpecialties?.includes(specialty) ? 'Eligible' : 'Not Eligible' }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Total Cases:</span>
                    <span class="font-medium ml-1">{{ stats.totalCases }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Excellent:</span>
                    <span class="font-medium ml-1 text-green-600">{{ stats.excellentCount }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Good:</span>
                    <span class="font-medium ml-1 text-blue-600">{{ stats.goodCount }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Needs Work:</span>
                    <span class="font-medium ml-1 text-red-600">{{ stats.needsImprovementCount }}</span>
                  </div>
                </div>
                
                <!-- Progress bar -->
                <div class="mt-3">
                  <div class="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Excellence Rate</span>
                    <span>{{ ((stats.excellentCount / stats.totalCases) * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" 
                         :style="{ width: `${(stats.excellentCount / stats.totalCases) * 100}%` }">
                    </div>
                  </div>
                </div>
                
                <!-- Eligibility criteria -->
                <div v-if="summary.contributorStatus?.eligibilityCriteria?.[specialty]" class="mt-3 text-xs">
                  <div class="grid grid-cols-3 gap-2">
                    <div :class="[
                      'flex items-center',
                      summary.contributorStatus.eligibilityCriteria[specialty].excellentCount >= 3
                        ? 'text-green-600' : 'text-gray-500'
                    ]">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      3+ Excellent
                    </div>
                    <div :class="[
                      'flex items-center',
                      summary.contributorStatus.eligibilityCriteria[specialty].recentExcellent
                        ? 'text-green-600' : 'text-gray-500'
                    ]">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Recent
                    </div>
                    <div :class="[
                      'flex items-center',
                      summary.contributorStatus.eligibilityCriteria[specialty].consistentPerformance
                        ? 'text-green-600' : 'text-gray-500'
                    ]">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Consistent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Evaluations -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Evaluations</h2>
          </div>
          <div class="p-6">
            <div v-if="!summary.recentEvaluations || summary.recentEvaluations.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No evaluations yet</h3>
              <p class="mt-1 text-sm text-gray-500">Complete some cases to see your evaluation history.</p>
            </div>
            
            <div v-else class="space-y-3">
              <div v-for="evaluation in summary.recentEvaluations" :key="evaluation.caseTitle + evaluation.completedAt"
                   class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ evaluation.caseTitle }}</p>
                  <p class="text-xs text-gray-500">{{ evaluation.specialty }}</p>
                </div>
                <div class="text-right">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    evaluation.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    evaluation.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ evaluation.rating }}
                  </span>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(evaluation.completedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contribution Stats (if eligible) -->
      <div v-if="summary.contributorStatus?.isEligible && summary.contributionStats" 
           class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Contribution Statistics</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-600">{{ summary.contributionStats.totalSubmitted }}</p>
              <p class="text-sm text-gray-600">Cases Submitted</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600">{{ summary.contributionStats.totalApproved }}</p>
              <p class="text-sm text-gray-600">Cases Approved</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-red-600">{{ summary.contributionStats.totalRejected }}</p>
              <p class="text-sm text-gray-600">Cases Rejected</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-purple-600">{{ summary.contributionStats.approvalRate?.toFixed(1) || 0 }}%</p>
              <p class="text-sm text-gray-600">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'PerformanceDashboard',
  setup() {
    const summary = ref({})
    const loading = ref(true)
    
    const loadPerformanceSummary = async () => {
      try {
        // TODO: Get actual user ID from auth
        const userId = 'current-user-id'
        const response = await fetch(`/api/performance/summary/${userId}`)
        
        if (response.ok) {
          summary.value = await response.json()
        } else {
          console.error('Failed to load performance summary')
        }
      } catch (error) {
        console.error('Error loading performance summary:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    onMounted(() => {
      loadPerformanceSummary()
    })
    
    return {
      summary,
      loading,
      formatDate
    }
  }
}
</script>

<style scoped>
.performance-dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>