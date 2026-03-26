import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Supabase client with SERVICE ROLE key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Setting up Document Management System\n');
console.log('═'.repeat(60));

async function createTables() {
  console.log('\n📋 Step 1: Creating database tables...');
  
  try {
    // Read the SQL schema file
    const schemaPath = join(__dirname, '../database/documents-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️  Warning: ${error.message}`);
      }
    }
    
    console.log('   ✅ Database tables created successfully');
  } catch (error) {
    console.error('   ❌ Error creating tables:', error.message);
    console.log('\n   💡 Please execute the SQL manually in Supabase SQL Editor:');
    console.log('   File: backend/database/documents-schema.sql\n');
  }
}

async function createStorageBuckets() {
  console.log('\n📦 Step 2: Creating storage buckets...');
  
  try {
    // Create documents bucket
    const { data: docBucket, error: docError } = await supabase.storage
      .createBucket('documents', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: null // Allow all types
      });
    
    if (docError && !docError.message.includes('already exists')) {
      throw docError;
    }
    
    console.log('   ✅ "documents" bucket created');
    
    // Create meeting-minutes bucket
    const { data: minutesBucket, error: minutesError } = await supabase.storage
      .createBucket('meeting-minutes', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
    
    if (minutesError && !minutesError.message.includes('already exists')) {
      throw minutesError;
    }
    
    console.log('   ✅ "meeting-minutes" bucket created');
  } catch (error) {
    console.error('   ❌ Error creating buckets:', error.message);
    console.log('\n   💡 Please create buckets manually in Supabase Dashboard:');
    console.log('   1. Go to Storage section');
    console.log('   2. Create bucket: "documents" (public, 10MB limit)');
    console.log('   3. Create bucket: "meeting-minutes" (public, 10MB limit)\n');
  }
}

async function verifySetup() {
  console.log('\n🔍 Step 3: Verifying setup...');
  
  try {
    // Check if tables exist
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('count');
    
    const { data: minutes, error: minError } = await supabase
      .from('meeting_minutes')
      .select('count');
    
    if (!docError && !minError) {
      console.log('   ✅ Database tables verified');
    } else {
      console.log('   ⚠️  Tables may not exist yet');
    }
    
    // Check if buckets exist
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (!bucketError) {
      const hasDocBucket = buckets.some(b => b.name === 'documents');
      const hasMinutesBucket = buckets.some(b => b.name === 'meeting-minutes');
      
      if (hasDocBucket && hasMinutesBucket) {
        console.log('   ✅ Storage buckets verified');
      } else {
        console.log('   ⚠️  Some buckets may be missing');
      }
    }
  } catch (error) {
    console.error('   ⚠️  Verification incomplete:', error.message);
  }
}

async function main() {
  try {
    console.log('\n📋 Document Management Setup Process');
    console.log('   This will create database tables and storage buckets\n');
    
    await createTables();
    await createStorageBuckets();
    await verifySetup();
    
    console.log('\n═'.repeat(60));
    console.log('✨ SETUP COMPLETED! ✨');
    console.log('═'.repeat(60));
    console.log('\n✅ Document management system is ready');
    console.log('✅ You can now upload documents and meeting minutes');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Open Admin Dashboard and test Document Vault');
    console.log('   3. Test Minutes Upload functionality\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n💡 Manual Setup Instructions:');
    console.error('   1. Go to Supabase Dashboard > SQL Editor');
    console.error('   2. Execute: backend/database/documents-schema.sql');
    console.error('   3. Go to Storage section');
    console.error('   4. Create "documents" bucket (public, 10MB)');
    console.error('   5. Create "meeting-minutes" bucket (public, 10MB)\n');
    process.exit(1);
  }
}

main();
