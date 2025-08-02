import { runSimulation } from './examples/transactionSimulationExample';

// --- CONFIGURATION ---
// 1. Get the User ID from your Firebase Authentication console.
// 2. Paste it here.
const USER_ID_TO_SIMULATE = 'pcHoTg4rwZXXmWWAmNQQVQWFhF13';

// ---------------------

const executeSimulation = async () => {
  if (USER_ID_TO_SIMULATE === 'pcHoTg4rwZXXmWWAmNQQVQWFhF13') {
    console.error('****************************************************************');
    console.error('** ERROR: Please configure the USER_ID_TO_SIMULATE variable **');
    console.error('** in the run-simulation.ts file before running the script. **');
    console.error('****************************************************************');
    return;
  }

  console.log(`Starting transaction simulation for user: ${USER_ID_TO_SIMULATE}`);
  try {
    await runSimulation(USER_ID_TO_SIMULATE);
    console.log('✅ Simulation completed successfully!');
  } catch (error) {
    console.error('❌ Error during simulation:', error);
  }
};

executeSimulation();