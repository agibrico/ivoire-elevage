import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const modes = [
  { id: 'ADMINISTRATION_GENERALE', flavor: 'admin', outputName: 'ivoire-admin.apk' },
  { id: 'AVIVOIRE', flavor: 'avivoire', outputName: 'avivoire.apk' },
  { id: 'PORCIVOIRE', flavor: 'porcivoire', outputName: 'porcivoire.apk' }
];

const projectRoot = process.cwd();
const buildOutputs = path.join(projectRoot, 'build-outputs');

if (!fs.existsSync(buildOutputs)) {
  fs.mkdirSync(buildOutputs);
}

// Ensure JAVA_HOME and ANDROID_HOME are set (adjust paths if necessary for your environment)
const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Program Files\\Android\\Android Studio\\jbr',
  ANDROID_HOME: path.join(process.env.USERPROFILE, 'AppData\\Local\\Android\\Sdk'),
};
env.PATH = `${path.join(env.JAVA_HOME, 'bin')};C:\\Program Files\\nodejs;${env.PATH}`;

// Environment variables cleanup
delete env.ANDROID_PREFS_ROOT;
env.ANDROID_USER_HOME = path.join(process.env.USERPROFILE, '.android');

try {
  for (const mode of modes) {
    console.log(`\n>>> Building APK for mode: ${mode.id} (${mode.flavor})`);

    // 1. Build Web App
    console.log('Building web assets...');
    execSync(`"C:\\Program Files\\nodejs\\npm.cmd" run build`, {
      stdio: 'inherit',
      env: { ...env, VITE_APK_MODE: mode.id }
    });

    // 2. Sync with Capacitor
    console.log('Syncing with Capacitor...');
    execSync('"C:\\Program Files\\nodejs\\npx.cmd" cap sync android', { stdio: 'inherit', env });

    // 3. Apply Logos for each flavor
    const logoFile = `logo-${mode.flavor}.jpg`;
    if (fs.existsSync(logoFile)) {
        console.log(`Applying logo: ${logoFile}...`);
        const resDir = path.join(projectRoot, 'android', 'app', 'src', mode.flavor, 'res', 'drawable');
        if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });
        fs.copyFileSync(logoFile, path.join(resDir, 'ic_launcher_foreground.jpg'));

        // Create adaptive icon XML
        const anyDpiDir = path.join(projectRoot, 'android', 'app', 'src', mode.flavor, 'res', 'mipmap-anydpi-v26');
        if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });

        const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@android:color/black"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;
        fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveIcon);
        fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveIcon);
    }

    // 4. Build APK with Gradle
    console.log('Compiling APK...');
    // Using gradlew.bat directly. We'll handle the subst and path check via Gradle properties if needed.
    // The previous successful build used a Z: drive subst.
    const gradleCmd = `cd android && gradlew.bat assemble${mode.flavor.charAt(0).toUpperCase() + mode.flavor.slice(1)}Debug -Dandroid.overridePathCheck=true`;
    execSync(gradleCmd, { stdio: 'inherit', env });

    // 5. Move APK to build-outputs
    const apkPath = path.join(projectRoot, 'android', 'app', 'build', 'outputs', 'apk', mode.flavor, 'debug', `app-${mode.flavor}-debug.apk`);
    if (fs.existsSync(apkPath)) {
      fs.copyFileSync(apkPath, path.join(buildOutputs, mode.outputName));
      console.log(`Success! APK generated: build-outputs/${mode.outputName}`);
    } else {
      console.error(`Error: APK not found at ${apkPath}`);
    }
  }

  console.log('\nAll builds completed! Check the "build-outputs" folder.');
} catch (error) {
  console.error('\nBuild failed:', error.message);
  process.exit(1);
}
