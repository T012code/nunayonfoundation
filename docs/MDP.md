# MDP: major deployment point

"Take it back to MDP" means: put the website back exactly as it was on 29 October 2026, after
the maintenance page was simplified. Everything below is frozen and must not be changed.

| Part | Where it's kept |
| --- | --- |
| Code | Git branch `mdp` and commit `1719618af6c8720a339acaeedc3b563cacbca513` |
| Live build | Vercel deployment `dpl_bteZdaLz1mcH7q9bcoFH88YAdRJn` (nunayonfoundation-qscd9vhtk-layo5.vercel.app) |
| Content | Supabase schema `mdp` (a copy of every table, taken at the same time; see `mdp.info`) |

New work never touches these: code changes go on other branches (currently
`claude/trusting-lovelace-xzsdbd`), and edits made in the admin change the live tables in
`public`, not the `mdp` copies.

## Going back to MDP

1. **Content.** In Supabase → SQL Editor, run `supabase/mdp/restore.sql`. It puts back
   programmes, news, the gallery, board members, page text, site settings, the media library
   list and email wording. It doesn't touch the team, subscribers, inbox messages, newsletters
   or logs (so nobody who unsubscribed is added back).
2. **Code.** On the working branch, undo everything after MDP without rewriting history:
   `git revert --no-edit 1719618af6c8720a339acaeedc3b563cacbca513..HEAD`, then push. Vercel
   builds and publishes it, and every page is rebuilt from the restored content.
   In a hurry, Vercel → Deployments → the MDP deployment above → Promote puts the old build
   back in a minute; do step 2 afterwards so the next push doesn't undo it.
3. **Database structure.** If later work added tables or columns, they stay (unused by the MDP
   code). If later work removed or renamed something MDP needs, write a migration that adds it
   back before step 2.

## Limits

- Uploaded photo files live in Supabase Storage; the snapshot lists them (`mdp.storage_files`)
  but doesn't copy them. Don't delete uploads in Storage if you may need MDP back.
- The email set-up password (Vault) and Vercel environment variables aren't part of MDP.
