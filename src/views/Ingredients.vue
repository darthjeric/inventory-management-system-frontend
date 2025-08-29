<template>
  <div class="ingredients">
    <h2>Your Ingredients</h2>
    <form @submit.prevent="addIngredient" class="add-form">
      <input type="text" v-model="newIngredient.name" placeholder="Ingredient Name" required />
      <input type="number" v-model="newIngredient.quantity" placeholder="Quantity" required />
      <input type="text" v-model="newIngredient.unit_of_measure" placeholder="Unit of Measure" required />
      <button type="submit">Add Ingredient</button>
    </form>
    <hr>
    <form @submit.prevent="deleteIngredient" class="delete-form">
        <select v-model="selectedIngredientId" required>
            <option :value="null" disabled>Select an ingredient to delete</option>
            <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                {{ ingredient.name }}
            </option>
        </select>
        <button type="submit">Delete Ingredient</button>
    </form>
    <hr>
    <div v-if="ingredients.length > 0">
      <ul>
        <li v-for="ingredient in ingredients" :key="ingredient.id">
          {{ ingredient.name }} - {{ ingredient.quantity }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No ingredients found. Add some to get started!</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      ingredients: [],
      newIngredient: {
        name: '',
        quantity: 0,
        unit_of_measure: ''
      },
      selectedIngredientID: null
    };
  },
  async created() {
    // This is a special Vue lifecycle hook that runs when the component is created
    this.fetchIngredients();
  },
  methods: {
    async fetchIngredients() {
      try {
        // Get the access token from local storage
        const accessToken = localStorage.getItem('accessToken');

        // Set the Authorization header with the access token
        const headers = {
          'Authorization': `Bearer ${accessToken}`
        };

        // Make the authenticated GET request
        const response = await axios.get('http://127.0.0.1:8000/api/ingredients/', { headers });

        // Assign the fetched data to our ingredients array
        this.ingredients = response.data;

        console.log('Ingredients fetched successfully:', this.ingredients);

      } catch (error) {
        console.error('Failed to fetch ingredients:', error.response.data);
        // Handle unauthorized errors, e.g., by redirecting to login
        if (error.response.status === 401) {
          this.$router.push('/');
        }
      }
    },
    // In src/views/Ingredients.vue

    async addIngredient() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            const quantityToSend = this.newIngredient.quantity !== '' ? this.newIngredient.quantity : null;

            const dataToSend = {
            name: this.newIngredient.name,
            quantity: quantityToSend,
            unit_of_measure: this.newIngredient.unit_of_measure,
            };

            console.log('Sending data:', dataToSend);

            await axios.post('http://127.0.0.1:8000/api/ingredients/', dataToSend, { headers });

            // Clear the form and refresh the ingredient list
            this.newIngredient.name = '';
            this.newIngredient.quantity = 0; // Changed from null to 0
            this.newIngredient.unit_of_measure = ''
            this.fetchIngredients();

            console.log('Ingredient added successfully!');
        } catch (error) {
            console.error('Failed to add ingredient:', error.response.data);
        }
    },
    async deleteIngredient() {
        if (!this.selectedIngredientId) {
            console.error("No ingredient selected for deletion.");
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            await axios.delete(`http://127.0.0.1:8000/api/ingredients/${this.selectedIngredientId}/`, { headers });

            console.log('Ingredient deleted successfully!');

            // Reset the dropdown selection
            this.selectedIngredientId = null;

            // Refresh the list of ingredients
            this.fetchIngredients();

        } catch (error) {
            console.error('Failed to delete ingredient:', error.response.data);
        }
    }
  }
};
</script>

<style scoped>
.ingredients {
  text-align: center;
  margin-top: 50px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
}
.add-form {
  margin-bottom: 20px;
}
.add-form input {
  padding: 8px;
  margin-right: 10px;
}
</style>