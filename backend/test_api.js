async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Exp',
        email: 'exp' + Date.now() + '@test.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    const token = data.token;
    
    // get categories
    const catRes = await fetch('http://localhost:5000/api/categories', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const cats = await catRes.json();
    const catId = cats[0].id;

    // add expense
    const expRes = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        amount: 100,
        date: '2026-06-11',
        category_id: catId,
        description: 'Test'
      })
    });
    
    const expData = await expRes.json();
    console.log('Status:', expRes.status);
    console.log('Response:', expData);
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
