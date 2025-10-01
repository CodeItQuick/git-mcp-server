# File Evolution Analysis Instructions for GitHub Copilot

## Objective
Help developers understand how a specific file has evolved over time by analyzing its complete history, identifying patterns, potential issues, and providing insights about the file's development trajectory.

## When to Use This Analysis
- Before making significant changes to understand the file's evolution patterns
- During code reviews to understand historical context
- When investigating potential regressions or architectural drift
- For knowledge transfer and understanding legacy code decisions
- When auditing code quality trends in critical files

## Step-by-Step Analysis Process

### Step 1: Get Complete File History
Use the `get-file-history` tool to retrieve the comprehensive evolution of the target file:

```
get-file-history(filename: "path/to/target/file", repository: "owner/repo-name")
```

**What to look for:**
- Number of commits that modified the file
- Frequency of changes over time
- Different contributors and their impact
- Types of changes (additions, deletions, modifications)

### Step 2: Analyze Change Patterns
From the file history data, identify:

**Temporal Patterns:**
- Are changes clustered in certain time periods?
- Long periods of stability vs. frequent modifications
- Correlation with release cycles or project phases

**Contributor Patterns:**
- Who are the primary maintainers of this file?
- Are changes concentrated among few developers or distributed?
- Knowledge concentration risk assessment

**Change Type Patterns:**
- Ratio of additions vs. deletions over time
- File size growth or reduction trends
- Complexity evolution indicators

### Step 3: Identify Evolution Phases
Categorize the file's history into distinct phases:

**Creation Phase:**
- Initial implementation approach
- Original architecture decisions
- Initial complexity and scope

**Growth Phase:**
- Feature additions and expansions
- API surface area changes
- Dependencies introduced

**Maturation Phase:**
- Bug fixes and optimizations
- Refactoring and cleanup
- Performance improvements

**Maintenance Phase:**
- Compatibility updates
- Security fixes
- Dependency updates

### Step 4: Spot Potential Issues
Look for warning signs in the evolution:

**Red Flags:**
- Frequent bug fixes in short periods
- Large commits with minimal descriptions
- Inconsistent coding styles between commits
- Repeated similar changes (indicating systemic issues)
- Rapid size growth without corresponding functionality

**Quality Indicators:**
- Well-documented changes with clear commit messages
- Gradual, incremental improvements
- Consistent contributor patterns
- Test additions alongside feature changes

### Step 5: Generate Evolution Summary
Provide a structured analysis including:

**Historical Overview:**
```
File: [filename]
Age: [time since creation]
Total Commits: [number]
Contributors: [count and key names]
Current Size: [lines/complexity metric]
```

**Key Evolution Milestones:**
- Major architectural changes
- Significant feature additions
- Important bug fixes or security updates
- Refactoring events

**Risk Assessment:**
- Code stability indicators
- Maintenance complexity
- Knowledge transfer risks
- Technical debt accumulation

**Recommendations:**
- Suggested improvements based on patterns
- Refactoring opportunities
- Documentation needs
- Testing gaps

## Example Analysis Templates

### For Legacy Files:
```
This file shows [X] years of evolution with [Y] commits from [Z] contributors.

EVOLUTION SUMMARY:
- Created: [date] by [author] with initial scope of [description]
- Major changes: [list 3-5 significant modifications]
- Current status: [stability assessment]

RISK FACTORS:
- [List any concerning patterns]
- [Complexity or maintenance issues]
- [Knowledge concentration problems]

RECOMMENDATIONS:
- [Specific actionable improvements]
```

### For Frequently Changed Files:
```
This file has high activity with [X] commits in the last [timeframe].

CHANGE PATTERNS:
- Primary change types: [bug fixes/features/refactoring]
- Main contributors: [list key developers]
- Change frequency: [assessment of stability]

QUALITY INDICATORS:
- [Positive patterns observed]
- [Areas of concern]

SUGGESTED ACTIONS:
- [Immediate improvements needed]
- [Long-term maintenance strategy]
```

## Integration with Other Analysis

### Combine with Related Tools:
- Use `get-commit-message-logs` for broader context around the same timeframe
- Use `get-commit-patch-logs` for detailed technical analysis of specific changes
- Use `get-file-content` to compare current state with historical versions

### Cross-Reference Analysis:
- Compare evolution patterns with related files
- Correlate changes with project milestones
- Analyze dependencies and impact on other components

## Communication Guidelines

### For Technical Audiences:
- Focus on architectural implications
- Highlight technical debt patterns
- Provide specific refactoring suggestions
- Include complexity metrics and trends

### For Management Audiences:
- Emphasize risk factors and maintenance costs
- Highlight contributor knowledge concentration
- Suggest resource allocation for improvements
- Focus on business impact of technical decisions

### For New Team Members:
- Explain historical context and decision rationale
- Highlight learning opportunities from past changes
- Identify key contributors for knowledge transfer
- Provide guided introduction to the file's purpose and evolution

## Success Metrics

A successful file evolution analysis should:
- Provide clear historical context for current code state
- Identify specific risks and improvement opportunities
- Offer actionable recommendations based on patterns
- Help inform future development decisions
- Facilitate better understanding among team members

## Follow-up Actions

After completing the analysis:
1. Document key findings in team knowledge base
2. Schedule discussions with key contributors if needed
3. Plan technical debt reduction based on identified issues
4. Set up monitoring for concerning patterns
5. Update development practices to address systematic issues
