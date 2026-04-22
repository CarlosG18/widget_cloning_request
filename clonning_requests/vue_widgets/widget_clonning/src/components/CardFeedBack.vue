<script lang="ts" setup>
const props = defineProps<{
  res: any;
}>();
</script>

<template>
  <div class="feedback-card">
    <div class="feedback-header">
      <div class="success-icon">
        <span class="checkmark">✔</span>
      </div>

      <p class="success-title">
        Clonagem realizada com sucesso
      </p>
    </div>

    <div v-if="res.success" class="feedback-grid">
      <div class="feedback-item">
        <p class="label">ID da nova solicitação</p>
        <p class="value">
          {{ res.newId ? res.newId : "sem informação" }}
        </p>
      </div>

      <div class="feedback-item">
        <p class="label">ProcessId</p>
        <p class="value">
          {{ res.processId ? res.processId : "sem informação" }}
        </p>
      </div>

      <div class="feedback-item">
        <p class="label">Data da clonagem</p>
        <p class="value">
          {{ new Date(res.date).toLocaleString() }}
        </p>
      </div>

      <div class="feedback-item">
        <p class="label">Resultado</p>
        <span class="status-badge">
          {{ res.success }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-card {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.success-icon {
  background-color: #dcfce7;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.checkmark {
  font-size: 1.25rem;
  color: #16a34a;
}

.success-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #16a34a;
  margin: 0;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  font-size: 0.875rem;
}

.feedback-item {
  display: flex;
  flex-direction: column;
}

.label {
  color: #9ca3af;
  margin: 0;
}

.value {
  font-weight: 500;
  margin: 0;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  background-color: #dcfce7;
  color: #15803d;
  width: fit-content;
}
</style>
