# Deploy WebCrown to Netlify

1. Push this project to GitHub.
2. Log in to Netlify and click "Add new site" > "Import an existing project".
3. Choose the GitHub repository and select the branch you want to deploy.
4. Set the build command to `npm run build` and the publish directory to `dist`.
5. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Save the site and wait for the build to finish.
7. Set a custom domain under Site configuration > Domain management.
8. Redeploy after changing content or env variables.

For local QA, run `npm run dev`, `npm run build`, and `npm run preview`.
