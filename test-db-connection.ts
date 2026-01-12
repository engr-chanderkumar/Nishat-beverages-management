import { supabase } from './src/supabase.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Fetch customers (should be at least one table with data)
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Sample customers:', customers);
    }

    // Test 2: Check if we can fetch inventory items
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(5);
    
    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
    } else {
      console.log('Sample inventory items:', inventory);
    }

  } catch (error) {
    console.error('Unexpected error during database test:', error);
  }
}

testConnection();
