@echo off
REM Workaround: Spring Boot Maven plugin fails when the project path has non-ASCII
REM characters (Vietnamese folder names). Map an ASCII drive letter, then run.
setlocal
set "DRIVE=X:"
subst %DRIVE% "%~dp0"
pushd %DRIVE%\
call mvnw.cmd spring-boot:run -DskipTests %*
set "EXITCODE=%ERRORLEVEL%"
popd
subst %DRIVE% /d
exit /b %EXITCODE%
