import { AlertCircle, CheckCircle, Database, FileText, Play, RefreshCw, User, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DatabaseService } from '../../services/database/databaseService';
import { logger } from '../../utils/logger';

interface TestResult {
    name: string;
    status: 'pass' | 'fail' | 'running' | 'pending';
    message: string;
    duration?: number;
    details?: any;
}

interface TestSuite {
    name: string;
    tests: TestResult[];
    running: boolean;
}

export const TestingConsole: React.FC = () => {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        { name: 'User Sign-On Tests', tests: [], running: false },
        { name: 'Idea Input Tests', tests: [], running: false },
        { name: 'Profile Database Tests', tests: [], running: false },
        { name: 'Database Status Tests', tests: [], running: false }
    ]);

    const [selectedSuite, setSelectedSuite] = useState<string>('User Sign-On Tests');
    const [isRunning, setIsRunning] = useState(false);

    const updateTestSuite = (suiteName: string, tests: TestResult[], running: boolean = false) => {
        setTestSuites(prev => prev.map(suite =>
            suite.name === suiteName ? { ...suite, tests, running } : suite
        ));
    };

    const addTestResult = (suiteName: string, test: TestResult) => {
        setTestSuites(prev => prev.map(suite =>
            suite.name === suiteName
                ? { ...suite, tests: [...suite.tests, test] }
                : suite
        ));
    };

    const updateTestResult = (suiteName: string, testName: string, updates: Partial<TestResult>) => {
        setTestSuites(prev => prev.map(suite =>
            suite.name === suiteName
                ? {
                    ...suite,
                    tests: suite.tests.map(test =>
                        test.name === testName ? { ...test, ...updates } : test
                    )
                }
                : suite
        ));
    };

    // User Sign-On Tests
    const runUserSignOnTests = async () => {
        const suiteName = 'User Sign-On Tests';
        updateTestSuite(suiteName, [], true);

        const tests = [
            'Supabase Connection Test',
            'User Existence Check',
            'User Login Test',
            'User Profile Retrieval',
            'Session Validation',
            'Logout Test'
        ];

        // Initialize all tests as pending
        tests.forEach(testName => {
            addTestResult(suiteName, { name: testName, status: 'pending', message: 'Waiting to run...' });
        });

        try {
            // Test 1: Supabase Connection
            updateTestResult(suiteName, 'Supabase Connection Test', { status: 'running', message: 'Testing connection...' });
            const startTime = Date.now();

            try {
                const { data, error } = await supabase.from('users').select('count').limit(1);
                const duration = Date.now() - startTime;

                if (error) throw error;
                updateTestResult(suiteName, 'Supabase Connection Test', {
                    status: 'pass',
                    message: 'Connection successful',
                    duration,
                    details: { response: data }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Supabase Connection Test', {
                    status: 'fail',
                    message: `Connection failed: ${error.message}`,
                    duration: Date.now() - startTime,
                    details: error
                });
            }

            // Test 2: User Existence Check
            updateTestResult(suiteName, 'User Existence Check', { status: 'running', message: 'Checking if test user exists...' });
            const startTime2 = Date.now();

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', 'mishra03supragya@gmail.com')
                    .single();

                const duration2 = Date.now() - startTime2;

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    updateTestResult(suiteName, 'User Existence Check', {
                        status: 'pass',
                        message: 'User found in database',
                        duration: duration2,
                        details: { user: data }
                    });
                } else {
                    updateTestResult(suiteName, 'User Existence Check', {
                        status: 'fail',
                        message: 'User not found in database',
                        duration: duration2,
                        details: { error: 'User does not exist' }
                    });
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'User Existence Check', {
                    status: 'fail',
                    message: `Database query failed: ${error.message}`,
                    duration: Date.now() - startTime2,
                    details: error
                });
            }

            // Test 3: User Login Test
            updateTestResult(suiteName, 'User Login Test', { status: 'running', message: 'Attempting login...' });
            const startTime3 = Date.now();

            try {
                const result = await DatabaseService.signIn('mishra03supragya@gmail.com', '123456789');
                const duration3 = Date.now() - startTime3;

                if (result.user) {
                    updateTestResult(suiteName, 'User Login Test', {
                        status: 'pass',
                        message: 'Login successful',
                        duration: duration3,
                        details: { userId: result.user.id, email: result.user.email }
                    });
                } else {
                    updateTestResult(suiteName, 'User Login Test', {
                        status: 'fail',
                        message: 'Login failed - no user returned',
                        duration: duration3
                    });
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'User Login Test', {
                    status: 'fail',
                    message: `Login failed: ${error.message}`,
                    duration: Date.now() - startTime3,
                    details: error
                });
            }

            // Test 4: User Profile Retrieval
            updateTestResult(suiteName, 'User Profile Retrieval', { status: 'running', message: 'Retrieving user profile...' });
            const startTime4 = Date.now();

            try {
                const profile = await DatabaseService.getCurrentUser();
                const duration4 = Date.now() - startTime4;

                if (profile) {
                    updateTestResult(suiteName, 'User Profile Retrieval', {
                        status: 'pass',
                        message: 'Profile retrieved successfully',
                        duration: duration4,
                        details: profile
                    });
                } else {
                    updateTestResult(suiteName, 'User Profile Retrieval', {
                        status: 'fail',
                        message: 'No profile found',
                        duration: duration4
                    });
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'User Profile Retrieval', {
                    status: 'fail',
                    message: `Profile retrieval failed: ${error.message}`,
                    duration: Date.now() - startTime4,
                    details: error
                });
            }

            // Test 5: Session Validation
            updateTestResult(suiteName, 'Session Validation', { status: 'running', message: 'Validating session...' });
            const startTime5 = Date.now();

            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                const duration5 = Date.now() - startTime5;

                if (error) throw error;

                if (session) {
                    updateTestResult(suiteName, 'Session Validation', {
                        status: 'pass',
                        message: 'Valid session found',
                        duration: duration5,
                        details: { userId: session.user.id, expires: session.expires_at }
                    });
                } else {
                    updateTestResult(suiteName, 'Session Validation', {
                        status: 'fail',
                        message: 'No active session',
                        duration: duration5
                    });
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'Session Validation', {
                    status: 'fail',
                    message: `Session validation failed: ${error.message}`,
                    duration: Date.now() - startTime5,
                    details: error
                });
            }

            // Test 6: Logout Test
            updateTestResult(suiteName, 'Logout Test', { status: 'running', message: 'Testing logout...' });
            const startTime6 = Date.now();

            try {
                await DatabaseService.signOut();
                const duration6 = Date.now() - startTime6;

                updateTestResult(suiteName, 'Logout Test', {
                    status: 'pass',
                    message: 'Logout successful',
                    duration: duration6
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Logout Test', {
                    status: 'fail',
                    message: `Logout failed: ${error.message}`,
                    duration: Date.now() - startTime6,
                    details: error
                });
            }

        } catch (error: any) {
            logger.error('TESTING', 'User sign-on test suite failed', error);
        } finally {
            updateTestSuite(suiteName, testSuites.find(s => s.name === suiteName)?.tests || [], false);
        }
    };

    // Idea Input Tests
    const runIdeaInputTests = async () => {
        const suiteName = 'Idea Input Tests';
        updateTestSuite(suiteName, [], true);

        const tests = [
            'Categories Fetch Test',
            'Create Test Idea',
            'Fetch Ideas Test',
            'Update Idea Test',
            'Delete Test Idea'
        ];

        tests.forEach(testName => {
            addTestResult(suiteName, { name: testName, status: 'pending', message: 'Waiting to run...' });
        });

        try {
            // Test 1: Categories Fetch
            updateTestResult(suiteName, 'Categories Fetch Test', { status: 'running', message: 'Fetching categories...' });
            const startTime = Date.now();

            try {
                const categories = await DatabaseService.getCategories();
                const duration = Date.now() - startTime;

                updateTestResult(suiteName, 'Categories Fetch Test', {
                    status: 'pass',
                    message: `Found ${categories.length} categories`,
                    duration,
                    details: categories
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Categories Fetch Test', {
                    status: 'fail',
                    message: `Categories fetch failed: ${error.message}`,
                    duration: Date.now() - startTime,
                    details: error
                });
            }

            // Test 2: Create Test Idea
            let testIdeaId: string | null = null;
            updateTestResult(suiteName, 'Create Test Idea', { status: 'running', message: 'Creating test idea...' });
            const startTime2 = Date.now();

            try {
                // First login to create idea
                await DatabaseService.signIn('mishra03supragya@gmail.com', '123456789');

                const testIdea = {
                    title: `Test Idea ${Date.now()}`,
                    description: 'This is a test idea created by the testing console.',
                    category_id: undefined // Will use first available category
                };

                const categories = await DatabaseService.getCategories();
                if (categories.length > 0) {
                    testIdea.category_id = categories[0].id;
                }

                const idea = await DatabaseService.createIdea(testIdea);
                testIdeaId = idea.id;
                const duration2 = Date.now() - startTime2;

                updateTestResult(suiteName, 'Create Test Idea', {
                    status: 'pass',
                    message: 'Test idea created successfully',
                    duration: duration2,
                    details: idea
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Create Test Idea', {
                    status: 'fail',
                    message: `Idea creation failed: ${error.message}`,
                    duration: Date.now() - startTime2,
                    details: error
                });
            }

            // Test 3: Fetch Ideas
            updateTestResult(suiteName, 'Fetch Ideas Test', { status: 'running', message: 'Fetching ideas...' });
            const startTime3 = Date.now();

            try {
                const ideas = await DatabaseService.getIdeas();
                const duration3 = Date.now() - startTime3;

                updateTestResult(suiteName, 'Fetch Ideas Test', {
                    status: 'pass',
                    message: `Found ${ideas.length} ideas`,
                    duration: duration3,
                    details: { count: ideas.length, sample: ideas.slice(0, 3) }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Fetch Ideas Test', {
                    status: 'fail',
                    message: `Ideas fetch failed: ${error.message}`,
                    duration: Date.now() - startTime3,
                    details: error
                });
            }

            // Test 4: Update Idea (if we created one)
            if (testIdeaId) {
                updateTestResult(suiteName, 'Update Idea Test', { status: 'running', message: 'Updating test idea...' });
                const startTime4 = Date.now();

                try {
                    const updatedIdea = await DatabaseService.updateIdea(testIdeaId, {
                        title: `Updated Test Idea ${Date.now()}`
                    });
                    const duration4 = Date.now() - startTime4;

                    updateTestResult(suiteName, 'Update Idea Test', {
                        status: 'pass',
                        message: 'Idea updated successfully',
                        duration: duration4,
                        details: updatedIdea
                    });
                } catch (error: any) {
                    updateTestResult(suiteName, 'Update Idea Test', {
                        status: 'fail',
                        message: `Idea update failed: ${error.message}`,
                        duration: Date.now() - startTime4,
                        details: error
                    });
                }
            } else {
                updateTestResult(suiteName, 'Update Idea Test', {
                    status: 'fail',
                    message: 'Skipped - no test idea created'
                });
            }

            // Test 5: Delete Test Idea (cleanup)
            if (testIdeaId) {
                updateTestResult(suiteName, 'Delete Test Idea', { status: 'running', message: 'Deleting test idea...' });
                const startTime5 = Date.now();

                try {
                    await DatabaseService.deleteIdea(testIdeaId);
                    const duration5 = Date.now() - startTime5;

                    updateTestResult(suiteName, 'Delete Test Idea', {
                        status: 'pass',
                        message: 'Test idea deleted successfully',
                        duration: duration5
                    });
                } catch (error: any) {
                    updateTestResult(suiteName, 'Delete Test Idea', {
                        status: 'fail',
                        message: `Idea deletion failed: ${error.message}`,
                        duration: Date.now() - startTime5,
                        details: error
                    });
                }
            } else {
                updateTestResult(suiteName, 'Delete Test Idea', {
                    status: 'fail',
                    message: 'Skipped - no test idea to delete'
                });
            }

        } catch (error: any) {
            logger.error('TESTING', 'Idea input test suite failed', error);
        } finally {
            updateTestSuite(suiteName, testSuites.find(s => s.name === suiteName)?.tests || [], false);
        }
    };

    // Profile Database Tests
    const runProfileDatabaseTests = async () => {
        const suiteName = 'Profile Database Tests';
        updateTestSuite(suiteName, [], true);

        const tests = [
            'User Profile Schema Test',
            'Profile Creation Test',
            'Profile Update Test',
            'User Preferences Test',
            'User Achievements Test'
        ];

        tests.forEach(testName => {
            addTestResult(suiteName, { name: testName, status: 'pending', message: 'Waiting to run...' });
        });

        try {
            // Test 1: User Profile Schema
            updateTestResult(suiteName, 'User Profile Schema Test', { status: 'running', message: 'Checking profile schema...' });
            const startTime = Date.now();

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, email, username, avatar_url, created_at, updated_at')
                    .limit(1);

                const duration = Date.now() - startTime;

                if (error) throw error;

                updateTestResult(suiteName, 'User Profile Schema Test', {
                    status: 'pass',
                    message: 'Profile schema accessible',
                    duration,
                    details: { columns: ['id', 'email', 'username', 'avatar_url', 'created_at', 'updated_at'] }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'User Profile Schema Test', {
                    status: 'fail',
                    message: `Schema test failed: ${error.message}`,
                    duration: Date.now() - startTime,
                    details: error
                });
            }

            // Test 2: Profile Creation Test
            updateTestResult(suiteName, 'Profile Creation Test', { status: 'running', message: 'Testing profile creation...' });
            const startTime2 = Date.now();

            try {
                const testUserId = `test-user-${Date.now()}`;
                const testEmail = `test${Date.now()}@example.com`;
                const testUsername = `testuser${Date.now()}`;

                const result = await DatabaseService.createUserProfile(testUserId, testEmail, testUsername);
                const duration2 = Date.now() - startTime2;

                // Cleanup
                await supabase.from('users').delete().eq('id', testUserId);

                updateTestResult(suiteName, 'Profile Creation Test', {
                    status: 'pass',
                    message: 'Profile creation successful',
                    duration: duration2,
                    details: result
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Profile Creation Test', {
                    status: 'fail',
                    message: `Profile creation failed: ${error.message}`,
                    duration: Date.now() - startTime2,
                    details: error
                });
            }

            // Test 3: Profile Update Test
            updateTestResult(suiteName, 'Profile Update Test', { status: 'running', message: 'Testing profile updates...' });
            const startTime3 = Date.now();

            try {
                // Login first
                await DatabaseService.signIn('mishra03supragya@gmail.com', '123456789');
                const currentUser = await DatabaseService.getCurrentUser();

                if (currentUser) {
                    const updatedProfile = await DatabaseService.updateUserProfile(currentUser.id, {
                        username: `updated-${Date.now()}`
                    });

                    const duration3 = Date.now() - startTime3;

                    updateTestResult(suiteName, 'Profile Update Test', {
                        status: 'pass',
                        message: 'Profile update successful',
                        duration: duration3,
                        details: updatedProfile
                    });
                } else {
                    throw new Error('No current user found');
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'Profile Update Test', {
                    status: 'fail',
                    message: `Profile update failed: ${error.message}`,
                    duration: Date.now() - startTime3,
                    details: error
                });
            }

            // Test 4: User Preferences Test
            updateTestResult(suiteName, 'User Preferences Test', { status: 'running', message: 'Testing user preferences...' });
            const startTime4 = Date.now();

            try {
                const currentUser = await DatabaseService.getCurrentUser();

                if (currentUser) {
                    const preferences = await DatabaseService.getUserPreferences(currentUser.id);
                    const duration4 = Date.now() - startTime4;

                    updateTestResult(suiteName, 'User Preferences Test', {
                        status: 'pass',
                        message: 'Preferences retrieved successfully',
                        duration: duration4,
                        details: preferences
                    });
                } else {
                    throw new Error('No current user found');
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'User Preferences Test', {
                    status: 'fail',
                    message: `Preferences test failed: ${error.message}`,
                    duration: Date.now() - startTime4,
                    details: error
                });
            }

            // Test 5: User Achievements Test
            updateTestResult(suiteName, 'User Achievements Test', { status: 'running', message: 'Testing user achievements...' });
            const startTime5 = Date.now();

            try {
                const currentUser = await DatabaseService.getCurrentUser();

                if (currentUser) {
                    const achievements = await DatabaseService.getUserAchievements(currentUser.id);
                    const duration5 = Date.now() - startTime5;

                    updateTestResult(suiteName, 'User Achievements Test', {
                        status: 'pass',
                        message: `Found ${achievements.length} achievements`,
                        duration: duration5,
                        details: achievements
                    });
                } else {
                    throw new Error('No current user found');
                }
            } catch (error: any) {
                updateTestResult(suiteName, 'User Achievements Test', {
                    status: 'fail',
                    message: `Achievements test failed: ${error.message}`,
                    duration: Date.now() - startTime5,
                    details: error
                });
            }

        } catch (error: any) {
            logger.error('TESTING', 'Profile database test suite failed', error);
        } finally {
            updateTestSuite(suiteName, testSuites.find(s => s.name === suiteName)?.tests || [], false);
        }
    };

    // Database Status Tests
    const runDatabaseStatusTests = async () => {
        const suiteName = 'Database Status Tests';
        updateTestSuite(suiteName, [], true);

        const tests = [
            'Database Connection Test',
            'Tables Accessibility Test',
            'RLS Policies Test',
            'Performance Test',
            'Data Integrity Test'
        ];

        tests.forEach(testName => {
            addTestResult(suiteName, { name: testName, status: 'pending', message: 'Waiting to run...' });
        });

        try {
            // Test 1: Database Connection
            updateTestResult(suiteName, 'Database Connection Test', { status: 'running', message: 'Testing database connection...' });
            const startTime = Date.now();

            try {
                const { data, error } = await supabase.from('users').select('count').limit(1);
                const duration = Date.now() - startTime;

                if (error) throw error;

                updateTestResult(suiteName, 'Database Connection Test', {
                    status: 'pass',
                    message: `Connection successful (${duration}ms)`,
                    duration,
                    details: { latency: duration }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Database Connection Test', {
                    status: 'fail',
                    message: `Connection failed: ${error.message}`,
                    duration: Date.now() - startTime,
                    details: error
                });
            }

            // Test 2: Tables Accessibility
            updateTestResult(suiteName, 'Tables Accessibility Test', { status: 'running', message: 'Testing table access...' });
            const startTime2 = Date.now();

            const tables = ['users', 'ideas', 'categories', 'votes', 'comments', 'user_preferences'];
            const tableResults: any = {};

            try {
                for (const table of tables) {
                    try {
                        const { data, error } = await supabase.from(table).select('*').limit(1);
                        if (error) throw error;
                        tableResults[table] = 'accessible';
                    } catch (error: any) {
                        tableResults[table] = `error: ${error.message}`;
                    }
                }

                const duration2 = Date.now() - startTime2;
                const accessibleCount = Object.values(tableResults).filter(v => v === 'accessible').length;

                updateTestResult(suiteName, 'Tables Accessibility Test', {
                    status: accessibleCount === tables.length ? 'pass' : 'fail',
                    message: `${accessibleCount}/${tables.length} tables accessible`,
                    duration: duration2,
                    details: tableResults
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Tables Accessibility Test', {
                    status: 'fail',
                    message: `Table access test failed: ${error.message}`,
                    duration: Date.now() - startTime2,
                    details: error
                });
            }

            // Test 3: RLS Policies Test
            updateTestResult(suiteName, 'RLS Policies Test', { status: 'running', message: 'Testing RLS policies...' });
            const startTime3 = Date.now();

            try {
                // Test authenticated access
                await DatabaseService.signIn('mishra03supragya@gmail.com', '123456789');
                const { data: authData, error: authError } = await supabase.from('users').select('*').limit(1);

                // Test unauthenticated access
                await DatabaseService.signOut();
                const { data: unauthData, error: unauthError } = await supabase.from('users').select('*').limit(1);

                const duration3 = Date.now() - startTime3;

                updateTestResult(suiteName, 'RLS Policies Test', {
                    status: 'pass',
                    message: 'RLS policies tested',
                    duration: duration3,
                    details: {
                        authenticated: { hasData: !!authData, error: authError?.message },
                        unauthenticated: { hasData: !!unauthData, error: unauthError?.message }
                    }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'RLS Policies Test', {
                    status: 'fail',
                    message: `RLS test failed: ${error.message}`,
                    duration: Date.now() - startTime3,
                    details: error
                });
            }

            // Test 4: Performance Test
            updateTestResult(suiteName, 'Performance Test', { status: 'running', message: 'Testing performance...' });
            const startTime4 = Date.now();

            try {
                const tests = [];

                // Test multiple queries
                for (let i = 0; i < 5; i++) {
                    const queryStart = Date.now();
                    await supabase.from('ideas').select('*').limit(10);
                    tests.push(Date.now() - queryStart);
                }

                const duration4 = Date.now() - startTime4;
                const avgLatency = tests.reduce((a, b) => a + b, 0) / tests.length;

                updateTestResult(suiteName, 'Performance Test', {
                    status: avgLatency < 1000 ? 'pass' : 'fail',
                    message: `Average query time: ${avgLatency.toFixed(2)}ms`,
                    duration: duration4,
                    details: { queries: tests, average: avgLatency }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Performance Test', {
                    status: 'fail',
                    message: `Performance test failed: ${error.message}`,
                    duration: Date.now() - startTime4,
                    details: error
                });
            }

            // Test 5: Data Integrity Test
            updateTestResult(suiteName, 'Data Integrity Test', { status: 'running', message: 'Testing data integrity...' });
            const startTime5 = Date.now();

            try {
                // Check for orphaned records and data consistency
                const { data: ideas, error: ideasError } = await supabase
                    .from('ideas')
                    .select('id, author_id, category_id')
                    .limit(100);

                if (ideasError) throw ideasError;

                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id')
                    .limit(1000);

                if (usersError) throw usersError;

                const userIds = new Set(users.map(u => u.id));
                const orphanedIdeas = ideas.filter(idea => !userIds.has(idea.author_id));

                const duration5 = Date.now() - startTime5;

                updateTestResult(suiteName, 'Data Integrity Test', {
                    status: orphanedIdeas.length === 0 ? 'pass' : 'fail',
                    message: `Found ${orphanedIdeas.length} orphaned ideas`,
                    duration: duration5,
                    details: { orphanedIdeas: orphanedIdeas.length, totalIdeas: ideas.length }
                });
            } catch (error: any) {
                updateTestResult(suiteName, 'Data Integrity Test', {
                    status: 'fail',
                    message: `Data integrity test failed: ${error.message}`,
                    duration: Date.now() - startTime5,
                    details: error
                });
            }

        } catch (error: any) {
            logger.error('TESTING', 'Database status test suite failed', error);
        } finally {
            updateTestSuite(suiteName, testSuites.find(s => s.name === suiteName)?.tests || [], false);
        }
    };

    const runTestSuite = async (suiteName: string) => {
        setIsRunning(true);

        try {
            switch (suiteName) {
                case 'User Sign-On Tests':
                    await runUserSignOnTests();
                    break;
                case 'Idea Input Tests':
                    await runIdeaInputTests();
                    break;
                case 'Profile Database Tests':
                    await runProfileDatabaseTests();
                    break;
                case 'Database Status Tests':
                    await runDatabaseStatusTests();
                    break;
            }
        } catch (error) {
            logger.error('TESTING', 'Test suite execution failed', error instanceof Error ? error : new Error('Unknown error'));
        } finally {
            setIsRunning(false);
        }
    };

    const runAllTests = async () => {
        setIsRunning(true);

        for (const suite of testSuites) {
            await runTestSuite(suite.name);
            // Small delay between suites
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setIsRunning(false);
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'fail':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'running':
                return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const currentSuite = testSuites.find(suite => suite.name === selectedSuite);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Database className="w-8 h-8 text-purple-400" />
                            <h1 className="text-3xl font-bold text-white">Testing Console</h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={runAllTests}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <Play className="w-5 h-5" />
                                Run All Tests
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Test Suites Sidebar */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Test Suites</h2>
                            {testSuites.map((suite) => (
                                <button
                                    key={suite.name}
                                    onClick={() => setSelectedSuite(suite.name)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${selectedSuite === suite.name
                                            ? 'bg-purple-600/30 border-purple-400 text-white'
                                            : 'bg-black/20 border-purple-500/20 text-gray-300 hover:bg-purple-600/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {suite.name.includes('Sign-On') && <User className="w-5 h-5" />}
                                            {suite.name.includes('Idea') && <FileText className="w-5 h-5" />}
                                            {suite.name.includes('Profile') && <User className="w-5 h-5" />}
                                            {suite.name.includes('Database Status') && <Database className="w-5 h-5" />}
                                            <span className="font-medium">{suite.name}</span>
                                        </div>
                                        {suite.running && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        {suite.tests.length > 0 && (
                                            <span>
                                                {suite.tests.filter(t => t.status === 'pass').length} passed, {' '}
                                                {suite.tests.filter(t => t.status === 'fail').length} failed
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Test Results */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">{selectedSuite}</h2>
                                <button
                                    onClick={() => runTestSuite(selectedSuite)}
                                    disabled={isRunning || currentSuite?.running}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <Play className="w-4 h-4" />
                                    Run Suite
                                </button>
                            </div>

                            <div className="space-y-3">
                                {currentSuite?.tests.map((test, index) => (
                                    <div
                                        key={index}
                                        className="bg-black/30 rounded-lg border border-purple-500/20 p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(test.status)}
                                                <span className="font-medium text-white">{test.name}</span>
                                            </div>
                                            {test.duration && (
                                                <span className="text-sm text-gray-400">{test.duration}ms</span>
                                            )}
                                        </div>
                                        <p className="text-gray-300 text-sm">{test.message}</p>
                                        {test.details && (
                                            <details className="mt-2">
                                                <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                                                    View Details
                                                </summary>
                                                <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 overflow-auto">
                                                    {JSON.stringify(test.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ))}

                                {currentSuite?.tests.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No tests run yet. Click "Run Suite" to start testing.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestingConsole;
