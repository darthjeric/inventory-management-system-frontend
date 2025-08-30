<template>
  <div class="recipe">
    <h2>Recipes</h2>

    <div v-if="recipes.length > 0">
      <ul>
        <li v-for="recipe in recipes" :key="recipe.id">
            <div>
                {{ recipe.name }} - {{ recipe.description }} - {{ recipe.batch_size }}
                <button @click="toggleIngredients(recipe.id)">
                    {{  expandedRecipeID === recipe.id ? '▲' : '▼' }}
                </button>
            </div>
            <div v-if="expandedRecipeID === recipe.id && recipe.ingredients">
                <h4>Ingredients:</h4>
                <ul>
                    <li v-for="item in recipe.ingredients" :key="item.id">
                        {{ item.ingredient.name }} - {{ item.required_quantity }} {{ item.unit_of_measure }}
                    </li>
                </ul>

            </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No recipes found. Add some to get started!</p>
    </div>
    <form @submit.prevent="addRecipe" class="add-form">
      <input type="text" v-model="newRecipe.name" placeholder="Recipe Name" required />
      <input type="text" v-model="newRecipe.description" placeholder="Description" required />
      <input type="text" v-model="newRecipe.batch_size" placeholder="Batch size" required />
      <button type="submit">Add Recipe</button>
    </form>
    <hr>
    <h3>Add Ingredients to Recipe</h3>
    <form @submit.prevent="addIngredientToRecipe" class="add-form">
        <div v-for="(item, index) in newIngredientToRecipe" :key="index" class="addExtraIngredient-row">
            <select v-model="item.recipeID" required>
                <option :value="null" disabled>Add to this recipe</option>
                <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
                    {{ recipe.name }}
                </option>
            </select>
            <select v-model="item.ingredientID" required>
                <option :value="null" disabled>Ingredient to add</option>
                <option v-for="ingredient in fullIngredientsList" :key="ingredient.id" :value="ingredient.id">
                    {{ ingredient.name }}
                </option>
            </select>
            <input type="text" v-model="item.quantity" placeholder="Quantity" required />
            <span>{{ getUnitOfMeasure(item.ingredientID) }}</span>
            <button type="button" @click="removeExtraIngredient(index)" v-if="newIngredientToRecipe.length > 1">
                -
            </button>
        </div>
        <button type="button" @click="addExtraIngredient">+ Add item</button>
        <br>
        <br>
        <button type="submit">Add Ingredients to Recipe</button>
    </form>
    <hr>
    <form @submit.prevent="deleteRecipe" class="delete-form">
        <select v-model="selectedRecipeID" required>
            <option :value="null" disabled>Select a recipe to delete</option>
            <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
                {{ recipe.name }}
            </option>
        </select>
        <button type="submit">Delete recipe</button>
    </form>
    <hr>
    <br>
    <router-link to="/dashboard" class="btn">Back to Dashboard</router-link>
    <hr>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      recipes: [],
      newRecipe: {
        name: '',
        description: '',
        batch_size: ''
      },
      selectedRecipeID: null,
      expandedRecipeID: null,
      fullIngredientsList: [],
      newIngredientToRecipe: [
        {
            recipeID: null,
            ingredientID: null,
            quantity: '',
            unit_of_measure: ''
        }
      ]
        
    };
  },
  watch: {
  // Watch for deep changes in the newIngredientToRecipe array
    newIngredientToRecipe: {
        handler(newItems) {
        newItems.forEach(item => {
            if (item.ingredientID) {
            const selectedIngredient = this.fullIngredientsList.find(
                ing => ing.id === item.ingredientID
            );
            if (selectedIngredient) {
                item.unit_of_measure = selectedIngredient.unit_of_measure;
            }
            }
        });
        },
        deep: true,
    },
  },

  async created() {
    // This is a special Vue lifecycle hook that runs when the component is created
    this.fetchRecipes();
  },
  methods: {
    async fetchRecipes() {
      try {
        // Get the access token from local storage
        const accessToken = localStorage.getItem('accessToken');

        // Set the Authorization header with the access token
        const headers = {
          'Authorization': `Bearer ${accessToken}`
        };

        // Make the authenticated GET request
        const recipeResponse = await axios.get('http://127.0.0.1:8000/api/recipes/', { headers });

        // Assign the fetched data to our ingredients array
        this.recipes = recipeResponse.data;

        //Fetch all ingredients once
        const ingredientsResponse = await axios.get('http://127.0.0.1:8000/api/ingredients/', { headers });
        this.fullIngredientsList = ingredientsResponse.data;

        console.log('Recipes fetched successfully:', this.recipes);

      } catch (error) {
        console.error('Failed to fetch recipes:', error.response.data);
        // Handle unauthorized errors, e.g., by redirecting to login
        if (error.response.status === 401) {
          this.$router.push('/');
        }
      }
    },

    async addRecipe() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            //const quantityToSend = this.newRecipe.quantity !== '' ? this.newIngredient.quantity : null;

            const dataToSend = {
            name: this.newRecipe.name,
            description: this.newRecipe.description,
            batch_size: this.newRecipe.batch_size,
            };

            //console.log('Sending data:', dataToSend);

            await axios.post('http://127.0.0.1:8000/api/recipes/', dataToSend, { headers });

            // Clear the form and refresh the ingredient list
            this.newRecipe.name = '';
            this.newRecipe.description = ''; 
            this.newRecipe.batch_size = ''

            //reset the expanded state
            this.expandedRecipeID = null;

            this.fetchRecipes();

            console.log('Recipe added successfully!');
        } catch (error) {
            console.error('Failed to add recipe:', error.response.data);
        }
    },
    async deleteRecipe() {
        if (!this.selectedRecipeID) {
            console.error("No recipe selected for deletion.");
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            await axios.delete(`http://127.0.0.1:8000/api/recipes/${this.selectedRecipeID}/`, { headers });

            console.log('Recipe deleted successfully!');

            // Reset the dropdown selection
            this.selectedRecipeID = null;

            // Refresh the list of ingredients
            this.fetchRecipes();

        } catch (error) {
            console.error('Failed to delete recipe:', error.response.data);
        }
    },
    async toggleIngredients(recipeId) {
        console.log('Toggling recipe ID:', recipeId)
        if (this.expandedRecipeID === recipeId) {
            this.expandedRecipeID = null;
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };
            
            // Fetch ingredient-recipes for the selected recipe
            const ingredientRecipesResponse = await axios.get(`http://127.0.0.1:8000/api/ingredient-recipes/?recipe=${recipeId}`, { headers });
            const ingredientRecipes = ingredientRecipesResponse.data;

            // Merge ingredient data from the local list
            const mergedIngredients = ingredientRecipes.map(item => {
                const ingredientDetails = this.fullIngredientsList.find(ing => ing.id === item.ingredient);
                return {
                    ...item,
                    ingredient: ingredientDetails
                };
            });

            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.ingredients = mergedIngredients;
                this.expandedRecipeID = recipeId;
            }

        } catch (error) {
            console.error('Failed to fetch recipe ingredients:', error.response.data);
        }
    },
    getUnitOfMeasure(ingredientID) {
        if (ingredientID) {
            const selectedIngredient = this.fullIngredientsList.find(
                ingredient => ingredient.id === ingredientID
            );
            return selectedIngredient ? selectedIngredient.unit_of_measure : '';
        }
        return '';
    },
    async addIngredientToRecipe(){
        try {
            const accessToken = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            for (const item of this.newIngredientToRecipe){
                if(!item.recipeID || !item.ingredientID || !item.quantity){
                    console.error("Please fill in all fields for each ingredient")
                    continue;
                }

                const addIngredientToRecipeData = {
                    recipe: item.recipeID,
                    ingredient: item.ingredientID,
                    required_quantity: item.quantity,
                    unit_of_measure: item.unit_of_measure
                }
                console.log(addIngredientToRecipeData)
                await axios.post(`http://127.0.0.1:8000/api/ingredient-recipes/`, addIngredientToRecipeData, { headers });

                console.log('Ingredient added to recipe successfully!');
            }
            

            // Reset the dropdown selection
            this.newIngredientToRecipe = [{
                recipeID: null,
                ingredientID: null,
                quantity: '',
                unit_of_measure: ''
            }]

            // Refresh the list of ingredients
            this.fetchRecipes();

        } catch (error) {
            console.error('Failed to restock ingredient:', error.response.data);
        }

    },
    addExtraIngredient() {
        this.newIngredientToRecipe.push({
            id: null,
            quantity: 0
        });
    },
    removeExtraIngredient(index) {
        this.newIngredientToRecipe.splice(index, 1);
    }

  },     
  computed: {
    selectedIngredientUnit() {
        // Check if an ingredient has been selected
        if (this.newIngredientToRecipe.ingredientID) {
            // Find the selected ingredient in the full list
            const selectedIngredient = this.fullIngredientsList.find(
                ingredient => ingredient.id === this.newIngredientToRecipe.ingredientID
            );
            // Return its unit of measure if it exists
            return selectedIngredient ? selectedIngredient.unit_of_measure : '';
        }
        return ''; // Return an empty string if no ingredient is selected
    },
},
}
</script>

<style scoped>
.recipe {
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