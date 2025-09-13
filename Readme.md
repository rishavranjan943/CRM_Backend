# CRM Backend

This is backend of CRM system.



# Features
1.Google OAuth login
2.Add Customers and Orders
3.Create,View,Delete segments.
4.Launch Campaigns and track delivery logs.
5.AI features :
    a.Campaign Message suggestions
    b.Campaign Performance summary
    c.Normal Language -> Segment Rules




# Tech Stak

Frontend : React.js
Backend : Node.js,Express.js
Database : MongoDB
Others : JWT,Gemini API



# Setup

1.Clone the repo

2.npm install

3.Create .env file in root directory with variables as :

MONGO_URI=DB_URL

PORT=port_number


GOOGLE_CLIENT_SECRET=google_client_secret_code
GOOGLE_CLIENT_ID=google_client_id


JWT_SECRET=secret_key

BASE_URL=backend_url

GEMINI_API_KEY=gemini_api_key

FRONTEND_URL=frontend_url


4.Run server 
npm start