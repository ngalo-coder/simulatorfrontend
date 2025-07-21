<template>
  <div class="contribute-case-form">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Contribute a New Case</h1>
        <p class="text-gray-600">
          Share your clinical expertise by creating a new virtual patient case for the community.
        </p>
        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-800 text-sm">
            <strong>Eligibility:</strong> This feature is available to clinicians who have achieved "Excellent" ratings in their specialty areas.
          </p>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="(step, index) in steps" :key="index" 
               :class="['flex items-center', index < steps.length - 1 ? 'flex-1' : '']">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            ]">
              {{ index + 1 }}
            </div>
            <span :class="[
              'ml-2 text-sm font-medium',
              currentStep >= index ? 'text-blue-600' : 'text-gray-500'
            ]">
              {{ step }}
            </span>
            <div v-if="index < steps.length - 1" 
                 :class="[
                   'flex-1 h-0.5 mx-4',
                   currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
                 ]">
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Step 1: Case Metadata -->
        <div v-show="currentStep === 0" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Case Title *</label>
              <input
                v-model="caseData.case_metadata.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 45-Year-Old Male with Chest Pain"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
              <select
                v-model="caseData.case_metadata.specialty"
                required
                @change="onSpecialtyChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Specialty</option>
                <option v-for="specialty in formData.specialties" :key="specialty" :value="specialty">
                  {{ specialty }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Program Area *</label>
              <select
                v-model="caseData.case_metadata.program_area"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Program Area</option>
                <option v-for="area in formData.programAreas" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>
            </div>
            
            <div v-if="availableModules.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                v-model="caseData.case_metadata.module"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Module (Optional)</option>
                <option v-for="module in availableModules" :key="module" :value="module">
                  {{ module }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
              <select
                v-model="caseData.case_metadata.difficulty"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Difficulty</option>
                <option v-for="difficulty in formData.difficulties" :key="difficulty" :value="difficulty">
                  {{ difficulty }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                v-model="caseData.case_metadata.location"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Location</option>
                <option v-for="location in formData.locations" :key="location" :value="location">
                  {{ location }}
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              v-model="tagsInput"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tags separated by commas (e.g., Chest Pain, Cardiovascular, Emergency)"
              @input="updateTags"
            />
            <div v-if="caseData.case_metadata.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span v-for="tag in caseData.case_metadata.tags" :key="tag"
                    class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Step 2: Patient Information -->
        <div v-show="currentStep === 1" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
              <input
                v-model="caseData.patient_persona.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                v-model.number="caseData.patient_persona.age"
                type="number"
                required
                min="0"
                max="120"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                v-model="caseData.patient_persona.gender"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option v-for="gender in formData.genders" :key="gender" :value="gender">
                  {{ gender }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <input
                v-model="caseData.patient_persona.occupation"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Teacher, Farmer, Student"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Chief Complaint *</label>
            <textarea
              v-model="caseData.patient_persona.chief_complaint"
              required
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What the patient (or guardian) would say as their main concern..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Emotional Tone *</label>
            <select
              v-model="caseData.patient_persona.emotional_tone"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Emotional Tone</option>
              <option v-for="tone in formData.emotionalTones" :key="tone" :value="tone">
                {{ tone }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Background Story</label>
            <textarea
              v-model="caseData.patient_persona.background_story"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief background about the patient's situation..."
            ></textarea>
          </div>

          <!-- Pediatric Guardian Section -->
          <div v-if="isPediatric" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 class="text-lg font-medium text-yellow-800 mb-4">Guardian Information (Pediatric Case)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                <input
                  v-model="caseData.patient_persona.guardian.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mary Doe"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  v-model="caseData.patient_persona.guardian.relationship"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relationship</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="grandmother">Grandmother</option>
                  <option value="grandfather">Grandfather</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Clinical Information -->
        <div v-show="currentStep === 2" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Clinical Information</h2>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hidden Diagnosis *</label>
            <input
              v-model="caseData.clinical_dossier.hidden_diagnosis"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acute Myocardial Infarction"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Onset</label>
              <input
                v-model="caseData.clinical_dossier.history_of_presenting_illness.onset"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 hours ago"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                v-model="caseData.clinical_dossier.history_of_presenting_illness.location"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Central chest"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Character</label>
              <input
                v-model="caseData.clinical_dossier.history_of_presenting_illness.character"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Crushing, sharp, dull"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Severity (1-10)</label>
              <input
                v-model.number="caseData.clinical_dossier.history_of_presenting_illness.severity"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Associated Symptoms</label>
            <input
              v-model="associatedSymptomsInput"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter symptoms separated by commas (e.g., Nausea, Sweating, Shortness of breath)"
              @input="updateAssociatedSymptoms"
            />
          </div>
        </div>

        <!-- Step 4: Evaluation Criteria -->
        <div v-show="currentStep === 3" class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Evaluation Criteria</h2>
          <p class="text-gray-600 mb-4">
            Define how clinicians will be evaluated when working through this case.
          </p>
          
          <div class="space-y-4">
            <div v-for="(criterion, index) in evaluationCriteria" :key="index" class="p-4 border border-gray-200 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div class="md:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Criterion Name</label>
                  <input
                    v-model="criterion.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., History_Taking"
                  />
                </div>
                <div class="md:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    v-model="criterion.description"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What should the clinician do?"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    @click="removeEvaluationCriterion(index)"
                    class="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              @click="addEvaluationCriterion"
              class="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
            >
              + Add Evaluation Criterion
            </button>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="previousStep"
            :disabled="currentStep === 0"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div class="space-x-4">
            <button
              type="button"
              @click="saveDraft"
              class="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
            >
              Save Draft
            </button>
            
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
            
            <button
              v-else
              type="submit"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit for Review
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  name: 'ContributeCaseForm',
  setup() {
    const currentStep = ref(0)
    const steps = ['Case Info', 'Patient', 'Clinical', 'Evaluation']
    
    const formData = reactive({
      specialties: [],
      modules: {},
      programAreas: [],
      difficulties: [],
      locations: [],
      genders: [],
      emotionalTones: []
    })
    
    const caseData = reactive({
      case_metadata: {
        title: '',
        specialty: '',
        program_area: '',
        module: '',
        difficulty: '',
        tags: [],
        location: ''
      },
      patient_persona: {
        name: '',
        age: null,
        gender: '',
        occupation: '',
        chief_complaint: '',
        emotional_tone: '',
        background_story: '',
        guardian: {
          name: '',
          relationship: '',
          age: null,
          occupation: '',
          emotional_state: '',
          background_info: '',
          communication_style: ''
        }
      },
      initial_prompt: 'You are now interacting with a virtual patient. Begin by asking your clinical questions.',
      clinical_dossier: {
        hidden_diagnosis: '',
        history_of_presenting_illness: {
          onset: '',
          location: '',
          radiation: '',
          character: '',
          severity: null,
          timing_and_duration: '',
          exacerbating_factors: '',
          relieving_factors: '',
          associated_symptoms: []
        },
        review_of_systems: {
          positive: [],
          negative: []
        },
        past_medical_history: [],
        medications: [],
        allergies: [],
        surgical_history: [],
        family_history: [],
        social_history: {
          smoking_status: '',
          alcohol_use: '',
          substance_use: '',
          diet_and_exercise: '',
          living_situation: ''
        }
      },
      simulation_triggers: {
        end_session: {
          condition_keyword: 'diagnosis',
          patient_response: 'Thank you, doctor. What do you think is wrong?'
        },
        invalid_input: {
          response: 'Sorry, I didn\'t understand that. Can you ask it differently?'
        }
      },
      evaluation_criteria: {}
    })
    
    const tagsInput = ref('')
    const associatedSymptomsInput = ref('')
    const evaluationCriteria = ref([
      { name: 'History_Taking', description: 'Did the clinician take a comprehensive history?' },
      { name: 'Physical_Examination', description: 'Was appropriate physical examination performed?' },
      { name: 'Differential_Diagnosis', description: 'Did the clinician consider appropriate differential diagnoses?' },
      { name: 'Communication_and_Empathy', description: 'Was the approach empathetic and communicative?' }
    ])
    
    const availableModules = computed(() => {
      return formData.modules[caseData.case_metadata.specialty] || []
    })
    
    const isPediatric = computed(() => {
      return caseData.patient_persona.age && caseData.patient_persona.age < 18
    })
    
    const loadFormData = async () => {
      try {
        const response = await fetch('/api/contribute/form-data')
        const data = await response.json()
        Object.assign(formData, data)
      } catch (error) {
        console.error('Error loading form data:', error)
      }
    }
    
    const onSpecialtyChange = () => {
      caseData.case_metadata.module = ''
    }
    
    const updateTags = () => {
      caseData.case_metadata.tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    }
    
    const updateAssociatedSymptoms = () => {
      caseData.clinical_dossier.history_of_presenting_illness.associated_symptoms = 
        associatedSymptomsInput.value
          .split(',')
          .map(symptom => symptom.trim())
          .filter(symptom => symptom.length > 0)
    }
    
    const addEvaluationCriterion = () => {
      evaluationCriteria.value.push({ name: '', description: '' })
    }
    
    const removeEvaluationCriterion = (index) => {
      evaluationCriteria.value.splice(index, 1)
    }
    
    const nextStep = () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++
      }
    }
    
    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    const saveDraft = async () => {
      try {
        // Update evaluation criteria
        caseData.evaluation_criteria = {}
        evaluationCriteria.value.forEach(criterion => {
          if (criterion.name && criterion.description) {
            caseData.evaluation_criteria[criterion.name] = criterion.description
          }
        })
        
        const response = await fetch('/api/contribute/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contributorId: 'current-user-id', // TODO: Get from auth
            contributorName: 'Current User', // TODO: Get from auth
            contributorEmail: 'user@example.com', // TODO: Get from auth
            caseData
          })
        })
        
        if (response.ok) {
          alert('Draft saved successfully!')
        } else {
          alert('Error saving draft')
        }
      } catch (error) {
        console.error('Error saving draft:', error)
        alert('Error saving draft')
      }
    }
    
    const handleSubmit = async () => {
      try {
        // Update evaluation criteria
        caseData.evaluation_criteria = {}
        evaluationCriteria.value.forEach(criterion => {
          if (criterion.name && criterion.description) {
            caseData.evaluation_criteria[criterion.name] = criterion.description
          }
        })
        
        const response = await fetch('/api/contribute/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contributorId: 'current-user-id', // TODO: Get from auth
            contributorName: 'Current User', // TODO: Get from auth
            contributorEmail: 'user@example.com', // TODO: Get from auth
            caseData
          })
        })
        
        if (response.ok) {
          alert('Case submitted successfully for review!')
          // TODO: Redirect to contributor dashboard
        } else {
          const error = await response.json()
          alert(`Error submitting case: ${error.error}`)
        }
      } catch (error) {
        console.error('Error submitting case:', error)
        alert('Error submitting case')
      }
    }
    
    onMounted(() => {
      loadFormData()
    })
    
    return {
      currentStep,
      steps,
      formData,
      caseData,
      tagsInput,
      associatedSymptomsInput,
      evaluationCriteria,
      availableModules,
      isPediatric,
      onSpecialtyChange,
      updateTags,
      updateAssociatedSymptoms,
      addEvaluationCriterion,
      removeEvaluationCriterion,
      nextStep,
      previousStep,
      saveDraft,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.contribute-case-form {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>