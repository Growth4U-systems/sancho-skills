import csv, statistics, datetime
from collections import Counter

rows=[]
with open('customers.csv') as f:
    for r in csv.DictReader(f):
        rows.append(r)

def d(s):
    return datetime.date.fromisoformat(s) if s else None

for r in rows:
    r['signup']=d(r['signup_date'])
    r['last']=d(r['last_activity_date'])
    r['churn']=d(r['churn_date']) if r['churn_date'] else None
    r['sessions']=int(r['sessions_90d'])
    r['mrr']=int(r['mrr_eur'])
    r['tot']=int(r['total_revenue_eur'])
    r['tickets']=int(r['support_tickets_90d'])

N=len(rows)
REF=max(r['last'] for r in rows)
today=datetime.date(2026,10,21)
print("N=",N,"ref(last activity max)=",REF,"today=",today)
print("signup range:",min(r['signup'] for r in rows),max(r['signup'] for r in rows))
print("STATUS:",Counter(r['status'] for r in rows))
print("PLAN:",Counter(r['plan'] for r in rows))
print("INDUSTRY:",Counter(r['industry'] for r in rows))
print("SIZE:",Counter(r['company_size'] for r in rows))
print("ONBOARD:",Counter(r['onboarding_completed'] for r in rows))

active=[r for r in rows if r['status']=='active']
churned=[r for r in rows if r['status']=='churned']
print("active=",len(active),"churned=",len(churned))

def avg(xs): return round(sum(xs)/len(xs),1) if xs else 0
print("avg MRR all active:",avg([r['mrr'] for r in active]))
print("avg revenue all:",avg([r['tot'] for r in rows]))
print("avg MRR by plan (active):")
for p in ['Free','Starter','Pro','Enterprise']:
    g=[r['mrr'] for r in active if r['plan']==p]
    if g: print("  ",p,"n=",len(g),"avgMRR=",avg(g),"median=",statistics.median(g))

life=[(r['churn']-r['signup']).days for r in churned if r['churn']]
if life:
    print("churned lifespan days: median",statistics.median(life),"mean",round(statistics.mean(life)),"min",min(life),"max",max(life))
    buck=Counter()
    for days in life:
        if days<=45: buck['0-45d']+=1
        elif days<=90: buck['46-90d']+=1
        elif days<=180: buck['91-180d']+=1
        elif days<=365: buck['181-365d']+=1
        else: buck['>365d']+=1
    print("churn timing:",dict(buck))

print("churn rate by plan:")
for p in ['Free','Starter','Pro','Enterprise']:
    g=[r for r in rows if r['plan']==p]
    c=[r for r in g if r['status']=='churned']
    if g: print("  ",p,"total=",len(g),"churned=",len(c),"rate=",round(100*len(c)/len(g),1),"%")
print("churn rate by industry:")
for ind in sorted(set(r['industry'] for r in rows)):
    g=[r for r in rows if r['industry']==ind]
    c=[r for r in g if r['status']=='churned']
    print("  ",ind,"total=",len(g),"churned=",len(c),"rate=",round(100*len(c)/len(g),1),"%")
print("churn rate by size:")
for s in sorted(set(r['company_size'] for r in rows)):
    g=[r for r in rows if r['company_size']==s]
    c=[r for r in g if r['status']=='churned']
    print("  ",s,"total=",len(g),"churned=",len(c),"rate=",round(100*len(c)/len(g),1),"%")

# onboarding vs churn
print("onboarding vs churn:")
for o in ['yes','no']:
    g=[r for r in rows if r['onboarding_completed']==o]
    c=[r for r in g if r['status']=='churned']
    print("  onboard=",o,"total=",len(g),"churned=",len(c),"rate=",round(100*len(c)/len(g),1),"%")

# sessions & tickets active vs churned (90d cols — note churned may be 0)
print("avg sessions_90d active:",avg([r['sessions'] for r in active]),"churned:",avg([r['sessions'] for r in churned]))
print("avg tickets_90d active:",avg([r['tickets'] for r in active]),"churned:",avg([r['tickets'] for r in churned]))

# tenure of active customers (months since signup to today)
ten=[(today-r['signup']).days/30.0 for r in active]
print("active tenure months: median",round(statistics.median(ten),1),"mean",round(statistics.mean(ten),1))
