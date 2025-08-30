<template>
  <div class="restock">
    <h2>Restock Ingredients</h2>
    <form @submit.prevent="restockIngredient" class="restock-form">
        <div v-for="(item, index) in restockItems" :key="index" class="restock-row">
            <select v-model="item.id" required>
                <option :value="null" disabled>Select an ingredient to restock</option>
                <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                    {{ ingredient.name }}
                </option>
            </select>
            <input
                type = "number"
                v-model = "item.quantity"
                placeholder="Quantity to add"
                step = "any"
                required
            />
            <button type="button" @click="removeRestockItem(index)" v-if="restockItems.length > 1">
                -
            </button>
        </div>
        <button type="button" @click="addRestockItem">+ Add item</button>
        <br>
        <router-link to="/dashboard" class="btn">Back to Dashboard</router-link>
        <br>

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
      restockItems: [
        {
            id: null,
            quantity: 0
        }
      ],
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

    async restockIngredient() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            for (const item of this.restockItems){
                if(!item.id){
                    continue;
                }
                const restockData = {
                    quantity: item.quantity
                }
                console.log(restockData)
                await axios.patch(`http://127.0.0.1:8000/api/restock/${item.id}/`, restockData, { headers });
            }
            

            console.log('Ingredient restocked successfully!');

            // Reset the dropdown selection
            this.restockItems = [{id: null, quantity: 0}]

            // Refresh the list of ingredients
            this.fetchIngredients();

        } catch (error) {
            console.error('Failed to restock ingredient:', error.response.data);
        }
    },
    addRestockItem() {
        this.restockItems.push({
            id: null,
            quantity: 0
        });
    },
    removeRestockItem(index) {
        this.restockItems.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.restock {
  text-align: center;
  margin-top: 50px;
}
.restock-form {
  margin-bottom: 20px;
}
.restock-form select,
.restock-form input {
  padding: 8px;
  margin-right: 10px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
}
</style>