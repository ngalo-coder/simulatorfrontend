<template>
  <div class="admin-case-review">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Case Review Dashboard</h1>
        <p class="text-gray-600">
          Review and approve cases contributed by clinicians.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Review</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.submitted || 0 }}</p>
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
              <p class="text-sm font-medium text-gray-600">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rejected</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.rejected || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Contributors</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.contributors || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.label }}
              <span v-if="tab.count !== undefined" 
                    :class="[
                      'ml-2 py-0.5 px-2 rounded-full text-xs',
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    ]">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Cases List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contributor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="case_ in filteredCases" :key="case_._id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ case_.caseData.case_metadata.title }}
                  </div>
                  <div class="text-sm text-gray-500">
                    ID: {{ case_.caseData.case_metadata.case_id }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ case_.caseData.case_metadata.difficulty }} • {{ case_.caseData.case_metadata.location }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ case_.contributorName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ case_.contributorEmail }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ case_.caseData.case_metadata.specialty }}
                  </div>
                  <div v-if="case_.caseData.case_metadata.module" class="text-sm text-gray-500">
                    {{ case_.caseData.case_metadata.module }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(case_.submittedAt) }}
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="reviewCase(case_)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Review
                    </button>
                    <button
                      v-if="case_.status === 'submitted'"
                      @click="quickApprove(case_)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Quick Approve
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredCases.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No cases to review</h3>
            <p class="mt-1 text-sm text-gray-500">No cases match the current filter.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="reviewingCase" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              Review Case: {{ reviewingCase.caseData.case_metadata.title }}
            </h3>
            <button @click="closeReviewModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Case Details -->
          <div class="space-y-6 max-h-96 overflow-y-auto mb-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Contributor</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.contributorName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Specialty</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.case_metadata.specialty }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Difficulty</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.case_metadata.difficulty }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Location</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.case_metadata.location }}</p>
              </div>
            </div>

            <!-- Patient Info -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-2">Patient Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.patient_persona.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Age & Gender</label>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ reviewingCase.caseData.patient_persona.age }} years old, {{ reviewingCase.caseData.patient_persona.gender }}
                  </p>
                </div>
              </div>
              <div class="mt-2">
                <label class="block text-sm font-medium text-gray-700">Chief Complaint</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.patient_persona.chief_complaint }}</p>
              </div>
            </div>

            <!-- Clinical Info -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-2">Clinical Information</h4>
              <div>
                <label class="block text-sm font-medium text-gray-700">Hidden Diagnosis</label>
                <p class="mt-1 text-sm text-gray-900">{{ reviewingCase.caseData.clinical_dossier.hidden_diagnosis }}</p>
              </div>
            </div>

            <!-- Evaluation Criteria -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-2">Evaluation Criteria</h4>
              <div class="space-y-2">
                <div v-for="(description, criterion) in reviewingCase.caseData.evaluation_criteria" :key="criterion">
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-gray-700">{{ criterion }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Actions -->
          <div class="border-t pt-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Review Comments</label>
              <textarea
                v-model="reviewComments"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add comments about this case..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="closeReviewModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                @click="requestRevision"
                class="px-4 py-2 text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200"
              >
                Request Revision
              </button>
              <button
                @click="rejectCase"
                class="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Reject
              </button>
              <button
                @click="approveCase"
                class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  name: 'AdminCaseReview',
  setup() {
    const activeTab = ref('submitted')
    const cases = ref([])
    const reviewingCase = ref(null)
    const reviewComments = ref('')
    
    const stats = reactive({
      submitted: 0,
      approved: 0,
      rejected: 0,
      contributors: 0
    })
    
    const tabs = computed(() => [
      { key: 'submitted', label: 'Pending Review', count: stats.submitted },
      { key: 'approved', label: 'Approved', count: stats.approved },
      { key: 'rejected', label: 'Rejected', count: stats.rejected },
      { key: 'needs_revision', label: 'Needs Revision' }
    ])
    
    const filteredCases = computed(() => {
      return cases.value.filter(case_ => case_.status === activeTab.value)
    })
    
    const loadCases = async () => {
      try {
        const response = await fetch(`/api/admin/contributed-cases?status=${activeTab.value}`)
        const data = await response.json()
        cases.value = data
      } catch (error) {
        console.error('Error loading cases:', error)
      }
    }
    
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/contribution-stats')
        const data = await response.json()
        
        // Update stats from API response
        data.statusStats.forEach(stat => {
          if (stats.hasOwnProperty(stat._id)) {
            stats[stat._id] = stat.count
          }
        })
        
        stats.contributors = data.topContributors.length
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    
    const reviewCase = async (case_) => {
      try {
        const response = await fetch(`/api/admin/contributed-cases/${case_._id}`)
        const fullCase = await response.json()
        reviewingCase.value = fullCase
        reviewComments.value = ''
      } catch (error) {
        console.error('Error loading case details:', error)
      }
    }
    
    const closeReviewModal = () => {
      reviewingCase.value = null
      reviewComments.value = ''
    }
    
    const approveCase = async () => {
      try {
        const response = await fetch(`/api/admin/contributed-cases/${reviewingCase.value._id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewerId: 'admin-user-id', // TODO: Get from auth
            reviewComments: reviewComments.value
          })
        })
        
        if (response.ok) {
          alert('Case approved successfully!')
          closeReviewModal()
          await loadCases()
          await loadStats()
        } else {
          alert('Error approving case')
        }
      } catch (error) {
        console.error('Error approving case:', error)
        alert('Error approving case')
      }
    }
    
    const rejectCase = async () => {
      if (!reviewComments.value.trim()) {
        alert('Please provide comments for rejection')
        return
      }
      
      try {
        const response = await fetch(`/api/admin/contributed-cases/${reviewingCase.value._id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewerId: 'admin-user-id', // TODO: Get from auth
            reviewComments: reviewComments.value
          })
        })
        
        if (response.ok) {
          alert('Case rejected')
          closeReviewModal()
          await loadCases()
          await loadStats()
        } else {
          alert('Error rejecting case')
        }
      } catch (error) {
        console.error('Error rejecting case:', error)
        alert('Error rejecting case')
      }
    }
    
    const requestRevision = async () => {
      if (!reviewComments.value.trim()) {
        alert('Please provide comments for revision request')
        return
      }
      
      try {
        const response = await fetch(`/api/admin/contributed-cases/${reviewingCase.value._id}/request-revision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewerId: 'admin-user-id', // TODO: Get from auth
            reviewComments: reviewComments.value,
            revisionRequests: [
              {
                field: 'general',
                comment: reviewComments.value
              }
            ]
          })
        })
        
        if (response.ok) {
          alert('Revision requested')
          closeReviewModal()
          await loadCases()
          await loadStats()
        } else {
          alert('Error requesting revision')
        }
      } catch (error) {
        console.error('Error requesting revision:', error)
        alert('Error requesting revision')
      }
    }
    
    const quickApprove = async (case_) => {
      if (!confirm('Are you sure you want to approve this case without detailed review?')) {
        return
      }
      
      try {
        const response = await fetch(`/api/admin/contributed-cases/${case_._id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewerId: 'admin-user-id', // TODO: Get from auth
            reviewComments: 'Quick approval'
          })
        })
        
        if (response.ok) {
          alert('Case approved successfully!')
          await loadCases()
          await loadStats()
        } else {
          alert('Error approving case')
        }
      } catch (error) {
        console.error('Error approving case:', error)
        alert('Error approving case')
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    // Watch for tab changes
    const changeTab = async (newTab) => {
      activeTab.value = newTab
      await loadCases()
    }
    
    onMounted(async () => {
      await loadStats()
      await loadCases()
    })
    
    return {
      activeTab,
      tabs,
      cases,
      filteredCases,
      reviewingCase,
      reviewComments,
      stats,
      reviewCase,
      closeReviewModal,
      approveCase,
      rejectCase,
      requestRevision,
      quickApprove,
      formatDate,
      changeTab
    }
  },
  watch: {
    activeTab: {
      handler: 'loadCases',
      immediate: false
    }
  },
  methods: {
    async loadCases() {
      try {
        const response = await fetch(`/api/admin/contributed-cases?status=${this.activeTab}`)
        const data = await response.json()
        this.cases = data
      } catch (error) {
        console.error('Error loading cases:', error)
      }
    }
  }
}
</script>

<style scoped>
.admin-case-review {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>