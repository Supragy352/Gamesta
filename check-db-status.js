// Quick database status check
const SUPABASE_URL = 'https://pzrpnenlhphwjfpatdzi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cnBuZW5saHBod2pmcGF0ZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODU2NTUsImV4cCI6MjA2NDk2MTY1NX0.iwWJhznyNvAs5k4X2eDw8H4IlJvfbjUAM8zNlI8pW_s'

const requiredTables = ['users', 'ideas', 'categories', 'votes', 'comments', 'notifications', 'user_preferences', 'user_achievements']

async function checkTableExists(tableName) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=count()&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        })

        if (response.ok) {
            console.log(`✅ Table '${tableName}' exists`)
            return true
        } else {
            console.log(`❌ Table '${tableName}' missing (${response.status})`)
            return false
        }
    } catch (error) {
        console.log(`❌ Table '${tableName}' error:`, error.message)
        return false
    }
}

async function checkAllTables() {
    console.log('🔍 Checking database tables...\n')

    const results = {}
    for (const table of requiredTables) {
        results[table] = await checkTableExists(table)
    }

    console.log('\n📊 Summary:')
    const existing = Object.values(results).filter(Boolean).length
    console.log(`${existing}/${requiredTables.length} tables exist`)

    const missing = requiredTables.filter(table => !results[table])
    if (missing.length > 0) {
        console.log('\n❌ Missing tables:', missing.join(', '))
    } else {
        console.log('\n✅ All required tables exist!')
    }
}

checkAllTables()
