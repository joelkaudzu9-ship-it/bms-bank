from supabase import create_client
url = "https://vmfdwlmjvaswmxkiqgvk.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZmR3bG1qdmFzd214a2lxZ3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMjYxMSwiZXhwIjoyMDk4NTc4NjExfQ.RfZssnWZhRBUWnTOIq2I1yL1dk8ozlcu38Z0kJpAgBk"
supabase = create_client(url, key)
WEEK_DATES = {1:"15-19 Jun 2026",2:"22-26 Jun 2026",3:"29 Jun-3 Jul 2026",4:"6-10 Jul 2026",5:"13-17 Jul 2026",6:"20-24 Jul 2026",7:"27-31 Jul 2026",8:"3-7 Aug 2026",9:"10-14 Aug 2026",10:"17-23 Aug 2026",11:"24-28 Aug 2026",12:"31 Aug-4 Sep 2026",13:"7-11 Sep 2026",14:"14-18 Sep 2026",15:"21-25 Sep 2026",16:"28 Sep-2 Oct 2026",17:"5-9 Oct 2026",18:"12-16 Oct 2026",19:"19-23 Oct 2026"}
result = supabase.table('resources').select('id, week_number').execute()
count = 0
for r in result.data:
    week = r.get('week_number')
    if week in WEEK_DATES:
        supabase.table('resources').update({'date': WEEK_DATES[week]}).eq('id', r['id']).execute()
        count += 1
        print(f"✅ Week {week}: {WEEK_DATES[week]}")
print(f"🎉 Done! Updated {count} resources")