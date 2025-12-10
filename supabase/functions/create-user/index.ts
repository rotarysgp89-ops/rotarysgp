import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Variáveis de ambiente essenciais
const PROJECT_URL = Deno.env.get('PROJECT_URL')
const ANON_KEY = Deno.env.get('ANON_KEY')
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função auxiliar para criar respostas JSON
function createJsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Garante que apenas o método POST seja aceito
  if (req.method !== 'POST') {
    return createJsonResponse({ error: 'Method Not Allowed' }, 405)
  }

  try {
    // Verifica autenticação do admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valida variáveis de ambiente
    if (!PROJECT_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
      return createJsonResponse({ error: 'Missing environment variables' }, 500)
    }

    // Cliente com token do usuário para verificar se é admin
    const supabaseClient = createClient(
      PROJECT_URL,
      ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verifica se o usuário atual é admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Verifica role de admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      return createJsonResponse({ error: 'Only admins can create users' }, 403)
    }

    // Obtém dados do novo usuário
    const { email, password, nome, role } = await req.json().catch(() => ({}))

    if (!email || !password || !nome || !role) {
      return createJsonResponse({ error: 'Missing required fields: email, password, nome, role' }, 400)
    }

    // Cliente admin para criar usuário
    const supabaseAdmin = createClient(
      PROJECT_URL,
      SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Cria o usuário com admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome }
    })

    if (createError) {
      return createJsonResponse({ error: createError.message }, 400)
    }

    // Adiciona a role ao usuário
    const { error: insertRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role })

    if (insertRoleError) {
      // Se falhar ao adicionar role, tenta deletar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return createJsonResponse({ error: 'Failed to assign role. User creation rolled back.' }, 500)
    }

    return createJsonResponse(
      { success: true, user: { id: newUser.user.id, email: newUser.user.email } },
      200
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createJsonResponse({ error: message }, 500)
  }
})
