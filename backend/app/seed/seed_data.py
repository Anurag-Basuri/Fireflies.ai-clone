import json
from datetime import date, datetime

from sqlalchemy.orm import Session

from app.core.db import engine, SessionLocal, Base
from app.core.logging import logger
from app.models import (
    User, Meeting, Participant, Speaker,
    TranscriptSegment, Summary, KeyTopic,
    ActionItem, Tag, MeetingTag,
)

# Predefined speaker colors for visual consistency
COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"]

MEETINGS_DATA = [
    {
        "title": "Q3 Product Strategy & Roadmap Planning",
        "meeting_date": date(2025, 7, 15),
        "duration_seconds": 3420,
        "participants": [
            {"name": "Sarah Chen", "email": "sarah@company.com", "role": "Product Lead"},
            {"name": "Marcus Johnson", "email": "marcus@company.com", "role": "Engineering Manager"},
            {"name": "Lisa Park", "email": "lisa@company.com", "role": "Designer"},
            {"name": "David Kim", "email": "david@company.com", "role": "Data Analyst"},
        ],
        "speakers": ["Sarah Chen", "Marcus Johnson", "Lisa Park", "David Kim"],
        "tags": ["Product", "Strategy", "Q3 Planning"],
        "summary": {
            "overview": "The product team convened to finalize the Q3 roadmap, focusing on three major initiatives: the AI-powered search feature, the mobile app redesign, and the enterprise dashboard. Sarah presented the prioritization framework based on customer feedback data showing 67% of users requesting better search capabilities. Marcus estimated 6-8 weeks for the search feature implementation with the current team capacity.",
            "bullet_notes": [
                "AI search feature prioritized as the top Q3 initiative based on customer demand analysis",
                "Mobile app redesign scheduled for mid-August with Lisa leading the UX overhaul",
                "Enterprise dashboard beta planned for September with 5 pilot customers",
                "Engineering capacity allows for 3 major features with current headcount",
                "Customer churn data shows search frustration as the #2 reason for downgrades",
                "Budget approved for 2 additional frontend engineers starting August",
                "Weekly sync meetings moved to Tuesdays to accommodate the APAC team",
                "Performance benchmarks set: search results under 200ms, mobile load under 2s"
            ],
            "action_items": [
                {"text": "Draft detailed PRD for AI search feature with user stories", "assignee": "Sarah Chen", "due_date": "2025-07-22"},
                {"text": "Set up performance monitoring dashboard for search latency", "assignee": "Marcus Johnson", "due_date": "2025-07-25"},
                {"text": "Complete mobile app wireframes and share with stakeholders", "assignee": "Lisa Park", "due_date": "2025-07-28"},
                {"text": "Prepare customer cohort analysis for enterprise beta selection", "assignee": "David Kim", "due_date": "2025-07-20"},
                {"text": "Schedule interviews with 3 enterprise prospects for dashboard feedback", "assignee": "Sarah Chen", "due_date": "2025-07-18"},
            ],
            "key_topics": [
                {"title": "Q3 Priorities & Framework", "start_time": 0.0},
                {"title": "AI Search Feature Deep Dive", "start_time": 420.0},
                {"title": "Mobile App Redesign Timeline", "start_time": 1200.0},
                {"title": "Enterprise Dashboard Planning", "start_time": 2100.0},
                {"title": "Resource Allocation & Hiring", "start_time": 2800.0},
                {"title": "Next Steps & Action Items", "start_time": 3200.0},
            ],
        },
        "transcript": [
            {"speaker": "Sarah Chen", "start": 0.0, "end": 18.5, "text": "Good morning everyone. Thanks for joining. Today we're finalizing our Q3 roadmap. I've pulled together the customer feedback data from the last quarter and I think we have a clear picture of where to focus."},
            {"speaker": "Marcus Johnson", "start": 19.0, "end": 32.0, "text": "Sounds good Sarah. I've also done a capacity analysis with the engineering leads. We should be realistic about what we can ship this quarter."},
            {"speaker": "Sarah Chen", "start": 33.0, "end": 55.0, "text": "Absolutely. So looking at the data, 67% of our users have flagged search as their biggest pain point. The current search is basically string matching and it fails completely on semantic queries. I'm proposing we make the AI-powered search our number one priority."},
            {"speaker": "David Kim", "start": 56.0, "end": 72.0, "text": "I can back that up with numbers. Our churn analysis shows search frustration is the second most common reason for downgrades, right after pricing concerns. We're losing about 12% of our mid-tier customers because of this."},
            {"speaker": "Lisa Park", "start": 73.0, "end": 90.0, "text": "From a UX perspective, I've been doing usability testing on the current search and it's painful to watch. Users expect natural language queries and they get confused when exact matches don't work."},
            {"speaker": "Marcus Johnson", "start": 91.0, "end": 115.0, "text": "I've talked to the backend team about this. With the new vector database we set up last month, we can implement semantic search in about 6 to 8 weeks. The infrastructure is already there, we just need to build the indexing pipeline and the query layer."},
            {"speaker": "Sarah Chen", "start": 116.0, "end": 140.0, "text": "That's great timing. For the second priority, I want to discuss the mobile app redesign. Lisa, you've been working on some concepts. Where are we with that?"},
            {"speaker": "Lisa Park", "start": 141.0, "end": 175.0, "text": "Yes, so the current mobile app is essentially a responsive web view and it shows. I've designed a native-first experience with gesture-based navigation, offline support, and a completely rethought information hierarchy. I should have the complete wireframes ready by end of next week."},
            {"speaker": "Marcus Johnson", "start": 176.0, "end": 200.0, "text": "The mobile team can pick this up mid-August if the designs are locked by then. We'd be looking at a 4-week sprint for the core functionality, then another 2 weeks for polish and testing."},
            {"speaker": "Sarah Chen", "start": 201.0, "end": 230.0, "text": "Perfect. And the third big item is the enterprise dashboard. David, you've been talking to our enterprise prospects. What are they asking for?"},
            {"speaker": "David Kim", "start": 231.0, "end": 265.0, "text": "The top requests are usage analytics across their teams, SSO integration which we already have the foundation for, and custom reporting. I've identified 5 companies from our pipeline that would be great beta partners. They're all on annual contracts and have been asking for these features specifically."},
            {"speaker": "Sarah Chen", "start": 266.0, "end": 290.0, "text": "Excellent. Marcus, do we have the bandwidth for all three if we get the two new frontend hires onboarded in August?"},
            {"speaker": "Marcus Johnson", "start": 291.0, "end": 320.0, "text": "It'll be tight but doable. The search feature is mostly backend. Mobile is a dedicated team. And the enterprise dashboard can be split between the new hires and our existing frontend engineers. I'd say we have an 80% confidence of hitting all three if there are no major surprises."},
            {"speaker": "Sarah Chen", "start": 321.0, "end": 345.0, "text": "Let's plan for that then. I'll draft the PRD for search by next Tuesday. Lisa, wireframes by the 28th. David, get me the beta customer shortlist by Friday. And Marcus, can you set up the performance monitoring so we can track our latency targets from day one?"},
            {"speaker": "Marcus Johnson", "start": 346.0, "end": 360.0, "text": "Will do. I'll also move our weekly syncs to Tuesdays so the APAC team can join. They've been missing the Monday sessions due to the time zone."},
            {"speaker": "Sarah Chen", "start": 361.0, "end": 380.0, "text": "Great call. Alright everyone, I think we have a solid plan. Let's execute and I'll check in with each of you individually this week. Thanks for a productive session."},
        ],
    },
    {
        "title": "Enterprise Sales Discovery — Acme Corp",
        "meeting_date": date(2025, 7, 10),
        "duration_seconds": 2580,
        "participants": [
            {"name": "James Wright", "email": "james@company.com", "role": "Account Executive"},
            {"name": "Rachel Torres", "email": "rachel@company.com", "role": "Solutions Engineer"},
            {"name": "Michael Chen", "email": "michael@acmecorp.com", "role": "VP Engineering"},
            {"name": "Amanda Foster", "email": "amanda@acmecorp.com", "role": "Director of Operations"},
        ],
        "speakers": ["James Wright", "Rachel Torres", "Michael Chen", "Amanda Foster"],
        "tags": ["Sales", "Enterprise", "Discovery"],
        "summary": {
            "overview": "Discovery call with Acme Corp's VP of Engineering and Director of Operations to understand their collaboration and meeting management needs. Acme Corp has 2,400 employees across 8 offices and currently uses a combination of Zoom recordings and manual note-taking. They're spending an estimated 15 hours per week per manager on meeting documentation and follow-up tracking.",
            "bullet_notes": [
                "Acme Corp has 2,400 employees across 8 global offices with 200+ managers",
                "Current workflow involves manual note-taking and Zoom recording reviews",
                "Estimated 15 hours per week per manager spent on meeting documentation",
                "Key pain point: action items from meetings frequently get lost or forgotten",
                "They need SOC 2 compliance and SSO integration as hard requirements",
                "Budget range indicated as $50K-$80K annually for enterprise licensing",
                "Decision timeline: vendor selection by end of August, rollout by Q4",
                "Competitive evaluation includes 3 other vendors in the space"
            ],
            "action_items": [
                {"text": "Send Acme Corp the enterprise security whitepaper and SOC 2 documentation", "assignee": "James Wright", "due_date": "2025-07-12"},
                {"text": "Prepare a custom demo environment with Acme Corp branding", "assignee": "Rachel Torres", "due_date": "2025-07-17"},
                {"text": "Schedule follow-up demo with Acme Corp IT security team", "assignee": "James Wright", "due_date": "2025-07-15"},
                {"text": "Draft ROI analysis based on 200 managers x 15 hours weekly", "assignee": "Rachel Torres", "due_date": "2025-07-18"},
            ],
            "key_topics": [
                {"title": "Company Overview & Team Structure", "start_time": 0.0},
                {"title": "Current Meeting Workflow Pain Points", "start_time": 360.0},
                {"title": "Feature Requirements & Must-Haves", "start_time": 900.0},
                {"title": "Security & Compliance Requirements", "start_time": 1500.0},
                {"title": "Budget & Decision Timeline", "start_time": 2000.0},
            ],
        },
        "transcript": [
            {"speaker": "James Wright", "start": 0.0, "end": 20.0, "text": "Michael, Amanda, thanks for taking the time today. I'd love to understand how your teams currently handle meeting documentation and where the biggest challenges are. Can you give us an overview of your organization?"},
            {"speaker": "Michael Chen", "start": 21.0, "end": 55.0, "text": "Sure. Acme Corp has about 2,400 employees now, spread across 8 offices globally. We have over 200 managers who are in back-to-back meetings all day. The engineering org alone has about 60 managers running standups, sprint reviews, architecture reviews, and one-on-ones."},
            {"speaker": "Amanda Foster", "start": 56.0, "end": 85.0, "text": "On the ops side, we have a similar story. Our managers are spending roughly 15 hours a week just on meeting documentation. That includes taking notes, sending follow-ups, and chasing action items. It's a massive productivity drain."},
            {"speaker": "Rachel Torres", "start": 86.0, "end": 100.0, "text": "That's a significant time investment. Are you currently using any tools for meeting recording or transcription?"},
            {"speaker": "Michael Chen", "start": 101.0, "end": 130.0, "text": "We record everything on Zoom, but nobody goes back to watch the recordings. They just sit there. Some teams have tried using transcription tools but nothing has stuck because the accuracy wasn't good enough and the summaries were too generic to be useful."},
            {"speaker": "Amanda Foster", "start": 131.0, "end": 160.0, "text": "The biggest issue for me is action item tracking. Things get discussed in meetings and then they just disappear. People forget what they committed to. We've tried using project management tools but the gap between what's discussed and what gets logged is huge."},
            {"speaker": "James Wright", "start": 161.0, "end": 180.0, "text": "That's exactly the problem we solve. Our platform automatically captures action items, assigns them, and tracks completion. Rachel, can you walk them through how that works?"},
            {"speaker": "Rachel Torres", "start": 181.0, "end": 220.0, "text": "Absolutely. So our AI listens to the meeting context and identifies action items as they come up naturally in conversation. It picks up on phrases like 'I'll handle that' or 'can you follow up on' and creates structured tasks with assignees and suggested deadlines. Managers can review and edit these right after the meeting."},
            {"speaker": "Michael Chen", "start": 221.0, "end": 250.0, "text": "That sounds promising. What about security? We're in a regulated industry so SOC 2 compliance is non-negotiable. And we need SSO integration with our Okta setup."},
            {"speaker": "Rachel Torres", "start": 251.0, "end": 275.0, "text": "We're SOC 2 Type II certified and we support SAML-based SSO including Okta, Azure AD, and Google Workspace. All data is encrypted at rest and in transit. I can share our security whitepaper after this call."},
            {"speaker": "Amanda Foster", "start": 276.0, "end": 300.0, "text": "What about the budget? We're looking at a range of 50 to 80K annually for an enterprise license. We're evaluating 3 other vendors in this space and we want to make a decision by end of August for a Q4 rollout."},
            {"speaker": "James Wright", "start": 301.0, "end": 325.0, "text": "That timeline works well for us. We can do a phased rollout starting with a pilot group of 50 managers. Rachel will set up a custom demo environment and we can schedule a deeper technical session with your IT security team next week."},
        ],
    },
    {
        "title": "Engineering Sprint 42 Retrospective",
        "meeting_date": date(2025, 7, 12),
        "duration_seconds": 1860,
        "participants": [
            {"name": "Marcus Johnson", "email": "marcus@company.com", "role": "Engineering Manager"},
            {"name": "Priya Sharma", "email": "priya@company.com", "role": "Senior Backend Engineer"},
            {"name": "Alex Rodriguez", "email": "alex@company.com", "role": "Frontend Engineer"},
            {"name": "Yuki Tanaka", "email": "yuki@company.com", "role": "QA Lead"},
        ],
        "speakers": ["Marcus Johnson", "Priya Sharma", "Alex Rodriguez", "Yuki Tanaka"],
        "tags": ["Engineering", "Sprint", "Retrospective"],
        "summary": {
            "overview": "Sprint 42 retrospective covering a 2-week sprint where the team shipped the notification system overhaul and the API rate limiting feature. The team completed 34 out of 38 story points (89% completion rate). Key discussion points included the CI/CD pipeline failures that cost 2 days of development time and the need for better cross-team API documentation.",
            "bullet_notes": [
                "Sprint velocity: 34/38 story points completed (89% completion rate)",
                "Notification system overhaul shipped on time with zero production issues",
                "API rate limiting feature completed but deployment delayed by CI/CD issues",
                "CI/CD pipeline had 3 critical failures costing approximately 2 development days",
                "Code review turnaround improved from 48 hours to 18 hours average",
                "QA automated test coverage increased from 72% to 81%",
                "Cross-team API documentation gaps identified as recurring blocker",
                "Team morale high despite pipeline challenges"
            ],
            "action_items": [
                {"text": "Investigate and fix the flaky CI/CD pipeline tests in the staging environment", "assignee": "Priya Sharma", "due_date": "2025-07-16"},
                {"text": "Set up automated API documentation generation from OpenAPI specs", "assignee": "Alex Rodriguez", "due_date": "2025-07-19"},
                {"text": "Create a shared runbook for CI/CD pipeline recovery procedures", "assignee": "Marcus Johnson", "due_date": "2025-07-18"},
                {"text": "Add integration tests for the notification system edge cases", "assignee": "Yuki Tanaka", "due_date": "2025-07-17"},
            ],
            "key_topics": [
                {"title": "Sprint Metrics & Velocity", "start_time": 0.0},
                {"title": "What Went Well", "start_time": 300.0},
                {"title": "What Didn't Go Well — CI/CD Issues", "start_time": 720.0},
                {"title": "Process Improvements", "start_time": 1200.0},
                {"title": "Sprint 43 Preview", "start_time": 1600.0},
            ],
        },
        "transcript": [
            {"speaker": "Marcus Johnson", "start": 0.0, "end": 22.0, "text": "Alright team, let's run through our Sprint 42 retro. We completed 34 out of 38 story points, which puts us at an 89% completion rate. That's actually our best sprint in the last quarter, so well done everyone."},
            {"speaker": "Priya Sharma", "start": 23.0, "end": 45.0, "text": "The notification overhaul was a big win. We rewrote the entire pub-sub system and it shipped with zero production issues. The new architecture handles 10x the throughput of the old system."},
            {"speaker": "Alex Rodriguez", "start": 46.0, "end": 68.0, "text": "Frontend side, the notification preferences UI got really positive feedback from the beta users. The real-time preview feature where you can see what each notification type looks like was a hit."},
            {"speaker": "Yuki Tanaka", "start": 69.0, "end": 90.0, "text": "QA perspective, we bumped our automated test coverage from 72% to 81%. I wrote 45 new integration tests for the notification flows. We caught 3 edge cases that would have been bugs in production."},
            {"speaker": "Marcus Johnson", "start": 91.0, "end": 112.0, "text": "Excellent. Now let's talk about what didn't go so well. The CI/CD pipeline was a real problem this sprint. Priya, you dealt with the brunt of that."},
            {"speaker": "Priya Sharma", "start": 113.0, "end": 145.0, "text": "Yeah, we had 3 critical pipeline failures. The staging environment kept running out of disk space because old Docker images weren't being cleaned up. Then we had a race condition in the parallel test runner that made tests flaky. I estimate we lost about 2 full days of development time debugging pipeline issues."},
            {"speaker": "Alex Rodriguez", "start": 146.0, "end": 170.0, "text": "On the process side, I want to flag the API documentation issue again. I was blocked for almost a full day because the payments team changed their API contract without updating the docs. We need a better system for cross-team API changes."},
            {"speaker": "Marcus Johnson", "start": 171.0, "end": 195.0, "text": "Good callout. I think we should set up automated API doc generation from our OpenAPI specs. That way the docs are always in sync with the actual implementation. Alex, can you look into that?"},
            {"speaker": "Alex Rodriguez", "start": 196.0, "end": 210.0, "text": "Yeah, I can set that up. There are good tools for this. I'll have a proposal by end of next week."},
            {"speaker": "Marcus Johnson", "start": 211.0, "end": 240.0, "text": "Perfect. Priya, can you take point on fixing the CI/CD issues? And I'll create a runbook for pipeline recovery so we're not debugging from scratch every time. Yuki, keep up the great work on test coverage, and maybe add some edge case tests for the notification batching we shipped."},
            {"speaker": "Yuki Tanaka", "start": 241.0, "end": 260.0, "text": "Already have those planned for Sprint 43. I also want to add load testing for the notification throughput to make sure we can actually sustain the 10x improvement under real-world conditions."},
        ],
    },
    {
        "title": "Customer Success QBR — TechVentures Inc",
        "meeting_date": date(2025, 7, 8),
        "duration_seconds": 2760,
        "participants": [
            {"name": "Olivia Martinez", "email": "olivia@company.com", "role": "Customer Success Manager"},
            {"name": "Tom Bradley", "email": "tom@company.com", "role": "Product Manager"},
            {"name": "Chris Evans", "email": "chris@techventures.com", "role": "CTO"},
            {"name": "Samantha Lee", "email": "samantha@techventures.com", "role": "Engineering Director"},
        ],
        "speakers": ["Olivia Martinez", "Tom Bradley", "Chris Evans", "Samantha Lee"],
        "tags": ["Customer Success", "QBR", "Enterprise"],
        "summary": {
            "overview": "Quarterly business review with TechVentures Inc, one of our largest enterprise accounts. Usage metrics show strong adoption with 94% weekly active rate across their 180-user deployment. Net Promoter Score improved from 42 to 67 since last quarter. Main discussion focused on upcoming API integrations with their internal tools and expanding the deployment to their international offices.",
            "bullet_notes": [
                "TechVentures deployment: 180 users with 94% weekly active rate",
                "NPS score improved from 42 to 67 since Q2 QBR",
                "Average meeting processing time reduced by 40% after our infrastructure upgrade",
                "They want API integration with their internal project management tool (custom-built)",
                "International expansion planned: 3 new offices in London, Tokyo, and Singapore",
                "Requesting multi-language transcript support for non-English meetings",
                "Contract renewal discussion: interested in a 3-year deal with volume discount",
                "Feature request: custom vocabulary/glossary for industry-specific terminology"
            ],
            "action_items": [
                {"text": "Share API documentation and webhook specs for their integration team", "assignee": "Tom Bradley", "due_date": "2025-07-12"},
                {"text": "Prepare international expansion pricing proposal for 3 new offices", "assignee": "Olivia Martinez", "due_date": "2025-07-18"},
                {"text": "Schedule technical deep-dive with TechVentures engineering for API integration", "assignee": "Tom Bradley", "due_date": "2025-07-15"},
                {"text": "Research multi-language support timeline and share roadmap update", "assignee": "Tom Bradley", "due_date": "2025-07-22"},
                {"text": "Draft 3-year renewal proposal with volume discount options", "assignee": "Olivia Martinez", "due_date": "2025-07-25"},
            ],
            "key_topics": [
                {"title": "Usage Metrics & Adoption Review", "start_time": 0.0},
                {"title": "Product Satisfaction & NPS Discussion", "start_time": 480.0},
                {"title": "API Integration Requirements", "start_time": 1020.0},
                {"title": "International Expansion Plans", "start_time": 1680.0},
                {"title": "Contract Renewal & Pricing", "start_time": 2280.0},
            ],
        },
        "transcript": [
            {"speaker": "Olivia Martinez", "start": 0.0, "end": 25.0, "text": "Chris, Samantha, great to have you for our Q3 quarterly review. I'm really excited to share some numbers with you because the adoption metrics are looking fantastic. Let me pull up the dashboard."},
            {"speaker": "Chris Evans", "start": 26.0, "end": 40.0, "text": "We've definitely felt the impact on our side. Our managers have been very vocal about how much time they're saving. Some of them told me they're getting back 8 to 10 hours a week."},
            {"speaker": "Olivia Martinez", "start": 41.0, "end": 70.0, "text": "That's amazing to hear. So the numbers back that up. You have 180 users deployed and 94% of them are active on a weekly basis. Your NPS score went from 42 last quarter to 67 this quarter, which is exceptional growth. Average meeting processing time is also down 40% since our infrastructure upgrade in June."},
            {"speaker": "Samantha Lee", "start": 71.0, "end": 100.0, "text": "The processing speed improvement is noticeable. We were seeing some lag with longer meetings, over an hour, but that seems resolved now. The team is particularly happy with the action item tracking. Our follow-through rate on meeting commitments has improved by about 30%."},
            {"speaker": "Tom Bradley", "start": 101.0, "end": 125.0, "text": "That's great feedback. I wanted to ask about the API integration you mentioned last quarter. You were exploring connecting our platform to your internal project management tool. Where did that land?"},
            {"speaker": "Chris Evans", "start": 126.0, "end": 160.0, "text": "Yeah, we're ready to move forward on that. We have a custom-built PM tool and we want action items from your platform to automatically create tasks in our system. We also want meeting summaries to be posted to relevant project channels. Our integration team is ready to start if you can share the API specs."},
            {"speaker": "Tom Bradley", "start": 161.0, "end": 185.0, "text": "I'll get you the API documentation and webhook specifications by end of this week. We can also schedule a technical deep-dive with your integration team to walk through the authentication flow and rate limits."},
            {"speaker": "Samantha Lee", "start": 186.0, "end": 220.0, "text": "The other big thing for us is international expansion. We're opening offices in London, Tokyo, and Singapore over the next 6 months. We'll need to roll out the platform to those teams, which means we need multi-language support, especially for Japanese meetings."},
            {"speaker": "Olivia Martinez", "start": 221.0, "end": 245.0, "text": "Multi-language support is on our roadmap. Tom, what's the current timeline for that?"},
            {"speaker": "Tom Bradley", "start": 246.0, "end": 270.0, "text": "We're targeting Q4 for European languages and Q1 next year for Asian languages including Japanese and Mandarin. I can share a detailed roadmap update with you next week."},
            {"speaker": "Chris Evans", "start": 271.0, "end": 300.0, "text": "That timing could work for Tokyo since that office opens in January. For the contract renewal, we're interested in a 3-year deal. We'd want a volume discount given we'll be going from 180 to potentially 400-plus users across the new offices."},
            {"speaker": "Olivia Martinez", "start": 301.0, "end": 320.0, "text": "Absolutely. I'll put together a 3-year proposal with tiered volume pricing. We can also include the international offices as a phased rollout so you're not paying for seats before the offices are operational."},
        ],
    },
    {
        "title": "1-on-1: Career Development & Performance Review",
        "meeting_date": date(2025, 7, 14),
        "duration_seconds": 1680,
        "participants": [
            {"name": "Marcus Johnson", "email": "marcus@company.com", "role": "Engineering Manager"},
            {"name": "Priya Sharma", "email": "priya@company.com", "role": "Senior Backend Engineer"},
        ],
        "speakers": ["Marcus Johnson", "Priya Sharma"],
        "tags": ["1-on-1", "Career", "Performance"],
        "summary": {
            "overview": "Bi-weekly 1-on-1 between Marcus and Priya focused on her career development trajectory toward a Staff Engineer role. Priya has been consistently delivering high-impact work including the notification system overhaul and the API rate limiting feature. Discussion covered the specific competencies needed for promotion, a technical mentorship opportunity, and a conference speaking proposal.",
            "bullet_notes": [
                "Priya's recent work on notification overhaul cited as strong evidence of Staff-level impact",
                "Staff Engineer promotion requires demonstrating cross-team technical leadership",
                "Mentorship opportunity: lead the junior engineer onboarding program for 2 new hires",
                "Conference speaking: Priya to submit a talk proposal to GopherCon on distributed systems",
                "Technical blog post series planned to increase visibility within the engineering org",
                "Next quarter goal: lead the database migration project as the technical lead",
                "Performance rating trending toward 'Exceeds Expectations' for the annual review",
                "Skip-level meeting with VP of Engineering scheduled for next month"
            ],
            "action_items": [
                {"text": "Draft a Staff Engineer self-assessment document with evidence of impact", "assignee": "Priya Sharma", "due_date": "2025-07-28"},
                {"text": "Submit talk proposal to GopherCon 2025 on distributed notification systems", "assignee": "Priya Sharma", "due_date": "2025-07-21"},
                {"text": "Schedule skip-level meeting with VP of Engineering for Priya", "assignee": "Marcus Johnson", "due_date": "2025-07-18"},
                {"text": "Create onboarding curriculum for the 2 new backend engineers", "assignee": "Priya Sharma", "due_date": "2025-08-01"},
            ],
            "key_topics": [
                {"title": "Recent Project Impact Review", "start_time": 0.0},
                {"title": "Staff Engineer Competency Framework", "start_time": 300.0},
                {"title": "Mentorship & Leadership Opportunities", "start_time": 720.0},
                {"title": "Conference & Visibility Strategy", "start_time": 1080.0},
                {"title": "Next Quarter Goals & Timeline", "start_time": 1380.0},
            ],
        },
        "transcript": [
            {"speaker": "Marcus Johnson", "start": 0.0, "end": 22.0, "text": "Hey Priya, thanks for the great work this sprint. Before we dive into career stuff, I want to say the notification system overhaul was genuinely impressive. Zero production issues on a complete rewrite, that's not easy to pull off."},
            {"speaker": "Priya Sharma", "start": 23.0, "end": 48.0, "text": "Thanks Marcus, I appreciate that. The team really came together on it. I spent a lot of time on the migration strategy to make sure we could do a zero-downtime cutover. That was the hardest part honestly, not the code itself but the deployment orchestration."},
            {"speaker": "Marcus Johnson", "start": 49.0, "end": 80.0, "text": "And that's exactly the kind of thinking that maps to Staff level. Speaking of which, let's talk about your promotion trajectory. I've been reviewing the Staff Engineer competency framework and I think you're strong in three out of five areas. Technical excellence and system design are clear. Where we need to build more evidence is in cross-team technical leadership and organizational impact."},
            {"speaker": "Priya Sharma", "start": 81.0, "end": 105.0, "text": "That makes sense. I've mostly been operating within our team's scope. What would cross-team leadership look like concretely?"},
            {"speaker": "Marcus Johnson", "start": 106.0, "end": 140.0, "text": "A few things. First, I want you to lead the onboarding program for the two new backend engineers we're hiring in August. Design the curriculum, mentor them through their first month. Second, the database migration project next quarter touches 4 different teams. I want you to be the technical lead on that, driving the architecture decisions and coordinating across teams."},
            {"speaker": "Priya Sharma", "start": 141.0, "end": 165.0, "text": "I'd love both of those opportunities. The database migration especially. I have strong opinions about how we should handle the schema evolution and I've been wanting to propose a new approach to zero-downtime migrations."},
            {"speaker": "Marcus Johnson", "start": 166.0, "end": 195.0, "text": "Perfect. I also want to talk about visibility. Have you considered conference speaking? Your notification system architecture would make a great talk. GopherCon has a CFP open and I think you'd have a strong submission."},
            {"speaker": "Priya Sharma", "start": 196.0, "end": 218.0, "text": "I've actually been thinking about that! I was also considering writing a technical blog post series about the distributed systems patterns we used. That could be a good lead-in to the conference talk."},
            {"speaker": "Marcus Johnson", "start": 219.0, "end": 245.0, "text": "Do both. The blog posts will help you refine the narrative. I'll also set up a skip-level with our VP of Engineering next month. It's important for senior leadership to have direct visibility into your contributions, especially ahead of the annual review cycle."},
            {"speaker": "Priya Sharma", "start": 246.0, "end": 265.0, "text": "That sounds great. I'll start on the self-assessment document this week and have a draft ready by end of month. And I'll submit the GopherCon proposal by next Monday."},
        ],
    },
    {
        "title": "Security & Compliance Architecture Review",
        "meeting_date": date(2025, 7, 11),
        "duration_seconds": 2340,
        "participants": [
            {"name": "Nathan Brooks", "email": "nathan@company.com", "role": "Security Engineer"},
            {"name": "Sarah Chen", "email": "sarah@company.com", "role": "Product Lead"},
            {"name": "Marcus Johnson", "email": "marcus@company.com", "role": "Engineering Manager"},
            {"name": "Rebecca Liu", "email": "rebecca@company.com", "role": "Compliance Officer"},
        ],
        "speakers": ["Nathan Brooks", "Sarah Chen", "Marcus Johnson", "Rebecca Liu"],
        "tags": ["Security", "Compliance", "Architecture"],
        "summary": {
            "overview": "Architecture review session focused on the security posture improvements needed ahead of the SOC 2 Type II audit scheduled for September. The team reviewed the current encryption standards, access control policies, and audit logging implementation. Nathan presented the penetration testing results which identified 3 medium-severity vulnerabilities that need remediation before the audit.",
            "bullet_notes": [
                "SOC 2 Type II audit scheduled for September 15th with the external auditor",
                "Penetration testing completed: 3 medium-severity, 7 low-severity findings",
                "Medium findings: SQL injection in legacy report endpoint, missing rate limiting on auth endpoints, insecure direct object reference in file downloads",
                "All data encryption upgraded to AES-256 for at-rest, TLS 1.3 for in-transit",
                "Audit logging coverage at 87%, needs to reach 95% for compliance",
                "Role-based access control (RBAC) overhaul completed last sprint",
                "Secrets management migrated from environment variables to HashiCorp Vault",
                "Incident response plan updated and tabletop exercise scheduled for August"
            ],
            "action_items": [
                {"text": "Fix SQL injection vulnerability in the legacy report generation endpoint", "assignee": "Marcus Johnson", "due_date": "2025-07-18"},
                {"text": "Implement rate limiting on all authentication endpoints (login, password reset, MFA)", "assignee": "Nathan Brooks", "due_date": "2025-07-21"},
                {"text": "Fix insecure direct object reference in file download API", "assignee": "Nathan Brooks", "due_date": "2025-07-19"},
                {"text": "Increase audit log coverage from 87% to 95% across all API endpoints", "assignee": "Marcus Johnson", "due_date": "2025-08-01"},
                {"text": "Schedule tabletop incident response exercise with the engineering team", "assignee": "Rebecca Liu", "due_date": "2025-08-08"},
                {"text": "Prepare SOC 2 evidence package: policies, procedures, and technical controls documentation", "assignee": "Rebecca Liu", "due_date": "2025-08-22"},
            ],
            "key_topics": [
                {"title": "Audit Timeline & Preparation Status", "start_time": 0.0},
                {"title": "Penetration Testing Results", "start_time": 360.0},
                {"title": "Vulnerability Remediation Plan", "start_time": 840.0},
                {"title": "Encryption & Data Protection Review", "start_time": 1380.0},
                {"title": "Audit Logging & Monitoring Gaps", "start_time": 1740.0},
                {"title": "Incident Response Planning", "start_time": 2100.0},
            ],
        },
        "transcript": [
            {"speaker": "Nathan Brooks", "start": 0.0, "end": 28.0, "text": "Thanks everyone for joining. We're 9 weeks out from our SOC 2 Type II audit on September 15th. I want to go through the penetration testing results I just got back and make sure we have a clear remediation plan. Overall we're in good shape but there are a few items that need immediate attention."},
            {"speaker": "Rebecca Liu", "start": 29.0, "end": 50.0, "text": "Before we get into the technical findings, I want to remind everyone that the auditors will be looking at not just the current state but our process documentation. We need policies, procedures, and evidence of consistent enforcement going back at least 6 months."},
            {"speaker": "Nathan Brooks", "start": 51.0, "end": 90.0, "text": "Right. So the pen test found 3 medium-severity and 7 low-severity vulnerabilities. The mediums are the ones I'm focused on. First, there's a SQL injection vulnerability in our legacy report generation endpoint. It's an old endpoint that predates our ORM migration and it's using raw SQL queries with string concatenation."},
            {"speaker": "Marcus Johnson", "start": 91.0, "end": 115.0, "text": "I know exactly which endpoint that is. It's the quarterly financial report generator. We've been meaning to migrate it to the new ORM for months. I'll prioritize that this sprint and have it fixed by end of next week."},
            {"speaker": "Nathan Brooks", "start": 116.0, "end": 145.0, "text": "Great. Second issue is missing rate limiting on our authentication endpoints. Login, password reset, and MFA verification all lack rate limiting, which means they're vulnerable to brute force attacks. I'll implement token bucket rate limiting on all auth endpoints by the 21st."},
            {"speaker": "Sarah Chen", "start": 146.0, "end": 165.0, "text": "Should we also add rate limiting to our API endpoints in general? Some of our enterprise customers have asked about that too."},
            {"speaker": "Nathan Brooks", "start": 166.0, "end": 190.0, "text": "Yes, that's on the roadmap but for the audit timeline I want to focus on auth first since that's the security-critical path. The third medium finding is an insecure direct object reference in our file download API. Users can modify the file ID parameter to access files belonging to other accounts."},
            {"speaker": "Marcus Johnson", "start": 191.0, "end": 215.0, "text": "That's a serious one. We need to add ownership verification on every file access request. Nathan, can you handle that along with the rate limiting?"},
            {"speaker": "Nathan Brooks", "start": 216.0, "end": 230.0, "text": "Yes, I'll fix both. On the positive side, our encryption is solid. We completed the upgrade to AES-256 for all data at rest and TLS 1.3 for all data in transit. The Vault migration for secrets management is also done."},
            {"speaker": "Rebecca Liu", "start": 231.0, "end": 260.0, "text": "Good progress. The one area I'm concerned about is audit logging. We're at 87% coverage right now and the auditors expect at least 95%. Marcus, we need to instrument the remaining API endpoints that aren't generating audit events."},
            {"speaker": "Marcus Johnson", "start": 261.0, "end": 285.0, "text": "I'll have the team go through every endpoint and add audit logging where it's missing. We can use our middleware to make this systematic. Target is 95% by August 1st."},
            {"speaker": "Rebecca Liu", "start": 286.0, "end": 310.0, "text": "Last thing: I want to schedule a tabletop incident response exercise for early August. We need to demonstrate that our IR plan isn't just a document, that the team actually knows how to execute it. I'll coordinate with the engineering leads to set that up."},
        ],
    },
]


def seed_database():
    # Idempotent seeding: create tables and populate with demo data if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).first()
        if existing_user:
            logger.info("Database already seeded, skipping")
            return

        logger.info("Seeding database with demo data...")

        # Create default user
        user = User(
            id=1,
            name="Anurag Basuri",
            email="anurag@fireflies.dev",
            avatar_url=None,
        )
        db.add(user)
        db.flush()

        # Create all meetings with full data
        for meeting_data in MEETINGS_DATA:
            meeting = Meeting(
                owner_id=1,
                title=meeting_data["title"],
                meeting_date=meeting_data["meeting_date"],
                duration_seconds=meeting_data["duration_seconds"],
                media_url="/media/sample-meeting.mp3",
                media_type="placeholder",
                status="ready",
            )
            db.add(meeting)
            db.flush()

            # Add participants
            for p in meeting_data["participants"]:
                participant = Participant(
                    meeting_id=meeting.id,
                    name=p["name"],
                    email=p["email"],
                    role=p["role"],
                )
                db.add(participant)

            # Add speakers with assigned colors
            speaker_map = {}
            for idx, label in enumerate(meeting_data["speakers"]):
                speaker = Speaker(
                    meeting_id=meeting.id,
                    label=label,
                    color_hex=COLORS[idx % len(COLORS)],
                )
                db.add(speaker)
                db.flush()
                speaker_map[label] = speaker.id

            # Add transcript segments
            for seq, seg in enumerate(meeting_data["transcript"]):
                segment = TranscriptSegment(
                    meeting_id=meeting.id,
                    speaker_id=speaker_map.get(seg["speaker"]),
                    start_time=seg["start"],
                    end_time=seg["end"],
                    content=seg["text"],
                    sequence_index=seq,
                )
                db.add(segment)

            # Add summary
            summary_data = meeting_data["summary"]
            summary = Summary(
                meeting_id=meeting.id,
                overview=summary_data["overview"],
                bullet_notes_json=json.dumps(summary_data["bullet_notes"]),
                generated_by="seed",
            )
            db.add(summary)

            # Add key topics
            for idx, topic in enumerate(summary_data["key_topics"]):
                kt = KeyTopic(
                    meeting_id=meeting.id,
                    title=topic["title"],
                    start_time=topic.get("start_time"),
                    order_index=idx,
                )
                db.add(kt)

            # Add action items
            for item in summary_data["action_items"]:
                action = ActionItem(
                    meeting_id=meeting.id,
                    text=item["text"],
                    assignee=item.get("assignee"),
                    due_date=None,
                    is_completed=False,
                )
                db.add(action)

            # Add tags
            for tag_name in meeting_data.get("tags", []):
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                mt = MeetingTag(meeting_id=meeting.id, tag_id=tag.id)
                db.add(mt)

        db.commit()
        logger.info(f"Seeded {len(MEETINGS_DATA)} meetings with full data")

    except Exception as e:
        db.rollback()
        logger.error(f"Seed failed: {e}")
        raise
    finally:
        db.close()
