@echo off
rem ==========================================================================
rem  DZ PIERCING - Lancer le site sur cet ordinateur (Windows)
rem  Double-clique sur ce fichier : il installe tout ce qu'il faut (la
rem  premiere fois, ou apres une mise a jour) puis ouvre le site.
rem  Pour arreter le site : ferme cette fenetre noire.
rem ==========================================================================
chcp 65001 >nul
title DZ PIERCING - site en local
cd /d "%~dp0front-end"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js n'est pas installe sur cet ordinateur.
  echo  La page de telechargement va s'ouvrir : choisis la version "LTS",
  echo  installe-la ^(suivant, suivant, terminer^), puis relance ce fichier.
  echo.
  start "" https://nodejs.org/fr/download
  pause
  exit /b 1
)

echo.
echo  [1/2] Installation / mise a jour des outils du site...
echo        (la premiere fois, cela peut prendre 1 a 2 minutes)
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo  L'installation a echoue. Verifie ta connexion internet puis relance ce fichier.
  pause
  exit /b 1
)

echo.
echo  [2/2] Lancement du site... il va s'ouvrir dans ton navigateur.
echo        Sur ton telephone (meme Wi-Fi) : utilise l'adresse "Network" ci-dessous.
echo        Pour arreter : ferme cette fenetre.
echo.
call npm run dev -- --open
pause
