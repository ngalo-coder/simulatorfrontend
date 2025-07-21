<template>
  <div class="contributor-dashboard">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Case Contributor Dashboard</h1>
        <p class="text-gray-600">
          Manage your contributed cases and create new ones for the community.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Cases</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
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
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Under Review</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.underReview }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-2 bg-gray-100 rounded-lg">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Drafts</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.drafts }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mb-8">
        <router-link
          to="/contribute/new"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create New Case
        </router-link>
      </div>

      <!-- Cases Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Your Contributed Cases</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Title
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              <tr v-for="case_ in cases" :key="case_._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ case_.caseData.case_metadata.title }}
                  </div>
                  <div class="text-sm text-gray-500">
                    ID: {{ case_.caseData.case_metadata.case_id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ case_.caseData.case_metadata.specialty }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(case_.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(case_.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(case_.submittedAt || case_.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      v-if="['draft', 'needs_revision'].includes(case_.status)"
                      @click="editCase(case_._id)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      @click="viewCase(case_._id)"
                      class="text-gray-600 hover:text-gray-900"
                    >
                      View
                    </button>
                    <button
                      v-if="case_.status === 'draft'"
                      @click="deleteCase(case_._id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="cases.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No cases yet</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating your first case.</p>
            <div class="mt-6">
              <router-link
                to="/contribute/new"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create New Case
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ContributorDashboard',
  setup() {
    const router = useRouter()
    const cases = ref([])
    const stats = reactive({
      total: 0,
      approved: 0,
      underReview: 0,
      drafts: 0
    })
    
    const loadCases = async () => {
      try {
        // TODO: Get actual contributor ID from auth
        const contributorId = 'current-user-id'
        const response = await fetch(`/api/contribute/my-cases/${contributorId}`)
        const data = await response.json()
        
        cases.value = data
        
        // Calculate stats
        stats.total = data.length
        stats.approved = data.filter(c => c.status === 'approved').length
        stats.underReview = data.filter(c => ['submitted', 'under_review'].includes(c.status)).length
        stats.drafts = data.filter(c => c.status === 'draft').length
      } catch (error) {
        console.error('Error loading cases:', error)
      }
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        'draft': 'bg-gray-100 text-gray-800',
        'submitted': 'bg-yellow-100 text-yellow-800',
        'under_review': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'needs_revision': 'bg-orange-100 text-orange-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusText = (status) => {
      const texts = {
        'draft': 'Draft',
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'needs_revision': 'Needs Revision'
      }
      return texts[status] || status
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    const editCase = (caseId) => {
      router.push(`/contribute/edit/${caseId}`)
    }
    
    const viewCase = (caseId) => {
      router.push(`/contribute/view/${caseId}`)
    }
    
    const deleteCase = async (caseId) => {
      if (!confirm('Are you sure you want to delete this draft case?')) {
        return
      }
      
      try {
        const response = await fetch(`/api/contribute/delete/${caseId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await loadCases() // Reload cases
        } else {
          alert('Error deleting case')
        }
      } catch (error) {
        console.error('Error deleting case:', error)
        alert('Error deleting case')
      }
    }
    
    onMounted(() => {
      loadCases()
    })
    
    return {
      cases,
      stats,
      getStatusBadgeClass,
      getStatusText,
      formatDate,
      editCase,
      viewCase,
      deleteCase
    }
  }
}
</script>

<style scoped>
.contributor-dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>