# Directory Evolution Analysis Instructions for GitHub Copilot

## Objective
Help developers understand how a specific directory and its contents have evolved over time by analyzing the complete history of all files within the directory, identifying structural patterns, architectural changes, and providing insights about the directory's development trajectory and organizational health.

## When to Use This Analysis
- Before major refactoring to understand directory structure evolution
- During architectural reviews to assess module organization over time
- When investigating feature development patterns across related files
- For knowledge transfer and understanding domain boundaries
- When auditing code organization and structural technical debt
- To assess team ownership and collaboration patterns within functional areas

## Step-by-Step Analysis Process

### Step 1: Get Directory Structure and File Inventory
Use directory exploration tools to understand the current state and get file histories:

```
get-directory-filenames(directory: "path/to/target/directory", repository: "owner/repo-name")
get-file-history(filename: "path/to/each/file/in/directory", repository: "owner/repo-name")
```

**What to look for:**
- Total number of files in the directory
- File types and naming patterns
- Subdirectory organization
- Creation dates of files to understand growth patterns

### Step 2: Analyze Directory Evolution Patterns
From the combined file history data, identify:

**Structural Patterns:**
- How has the directory organization changed over time?
- Are files being added, removed, or reorganized frequently?
- What subdirectories have been created or eliminated?
- How has file naming evolved?

**Growth Patterns:**
- Rate of file addition vs. deletion over time
- Periods of rapid expansion vs. consolidation
- Correlation between directory size and complexity

**Functional Evolution:**
- How has the purpose or scope of the directory changed?
- What new responsibilities have been added?
- What legacy functionality has been removed or refactored?

### Step 3: Analyze Contributor and Ownership Patterns
Across all files in the directory:

**Team Collaboration:**
- Which developers work most frequently in this directory?
- Are changes concentrated among few developers or distributed?
- How does contributor activity correlate with different subdirectories?

**Knowledge Distribution:**
- Are there files with single contributors (knowledge concentration risk)?
- Which areas have good knowledge sharing vs. silos?
- How has team ownership evolved over time?

**Cross-File Coordination:**
- Do changes often span multiple files in the directory?
- Are there frequent coordinated commits across the directory?
- What patterns emerge in cross-file refactoring?

### Step 4: Identify Architectural and Organizational Issues
Look for warning signs across the directory:

**Structural Red Flags:**
- Rapid growth without corresponding organization
- Frequent file moves or renames indicating unclear boundaries
- Mix of different abstraction levels in the same directory
- Inconsistent naming patterns suggesting unclear purpose
- Dead or rarely-changed files accumulating

**Collaboration Red Flags:**
- Files with single contributors creating knowledge silos
- Large commits affecting many files simultaneously
- Frequent merge conflicts in the directory
- Inconsistent coding styles between files

**Quality Indicators:**
- Consistent file organization and naming
- Gradual, purposeful growth patterns
- Good distribution of knowledge across team members
- Clear separation of concerns between subdirectories

### Step 5: Generate Directory Evolution Summary
Provide a comprehensive analysis including:

**Directory Overview:**
```
Directory: [directory path]
Age: [time since first file creation]
Total Files: [current count]
File Types: [breakdown by extension/type]
Contributors: [count and key names]
Primary Purpose: [current functional role]
```

**Evolution Timeline:**
- Initial creation and purpose
- Major organizational changes
- Growth phases and consolidation periods
- Architectural shifts and refactoring events

**Health Assessment:**
- Structural organization quality
- Knowledge distribution health
- Maintenance complexity indicators
- Technical debt accumulation

**Recommendations:**
- Structural improvements needed
- Knowledge transfer opportunities
- Refactoring priorities
- Team collaboration enhancements

## Example Analysis Templates

### For Feature/Domain Directories:
```
DIRECTORY EVOLUTION SUMMARY: [domain-name]/

CURRENT STATE:
- Files: [X] files across [Y] subdirectories
- Age: [timespan] with [Z] total commits
- Team: [N] contributors, primary maintainers: [names]

EVOLUTION PHASES:
- Foundation ([dates]): [initial scope and structure]
- Growth ([dates]): [expansion patterns and new capabilities]
- Maturation ([dates]): [stabilization and optimization]
- Current ([dates]): [recent changes and direction]

STRUCTURAL HEALTH:
- Organization: [assessment of current structure]
- Consistency: [naming and pattern adherence]
- Boundaries: [clarity of responsibilities]

COLLABORATION HEALTH:
- Knowledge Distribution: [assessment of contributor patterns]
- Team Coordination: [cross-file change patterns]
- Documentation: [presence of README, docs, etc.]

RISK FACTORS:
- [List specific structural or knowledge risks]
- [Areas requiring attention]

RECOMMENDATIONS:
- [Immediate structural improvements]
- [Knowledge sharing initiatives]
- [Long-term organizational strategy]
```

### For Infrastructure/Utility Directories:
```
INFRASTRUCTURE DIRECTORY ANALYSIS: [utility-name]/

PURPOSE EVOLUTION:
- Original scope: [initial purpose]
- Current scope: [expanded or changed purpose]
- Stability: [frequency of changes and reasons]

DEPENDENCY PATTERNS:
- Usage across codebase: [how widely used]
- Breaking changes: [frequency and impact]
- Version/compatibility management: [approach to changes]

MAINTENANCE PATTERNS:
- Update frequency: [how often files change]
- Contributor stability: [team ownership patterns]
- Quality indicators: [testing, documentation, etc.]

RECOMMENDATIONS:
- [Stability improvements]
- [Documentation needs]
- [Ownership clarity]
```

## Integration with Other Analysis Types

### Combine with Related Tools:
- Use `get-commit-message-logs` for broader context around directory changes
- Use `get-commit-patch-logs` for detailed analysis of structural changes
- Cross-reference with dependency analysis tools
- Correlate with issue tracking and feature development

### Multi-Directory Analysis:
- Compare evolution patterns across related directories
- Analyze inter-directory dependencies and coupling
- Assess overall architecture evolution across modules
- Identify system-wide refactoring opportunities

## Communication Guidelines

### For Technical Teams:
- Focus on architectural implications and technical debt
- Highlight refactoring opportunities and structural improvements
- Provide specific recommendations for code organization
- Include metrics on complexity and maintainability trends

### For Management:
- Emphasize knowledge concentration risks and team dependencies
- Highlight areas requiring additional resources or attention
- Focus on productivity impact of organizational issues
- Suggest team structure or process improvements

### For New Team Members:
- Explain directory purpose and historical context
- Identify key files and entry points for understanding
- Highlight learning paths through the directory structure
- Point out important contributors for knowledge transfer

## Success Metrics

A successful directory evolution analysis should:
- Provide clear understanding of the directory's purpose and scope evolution
- Identify specific organizational and structural improvement opportunities
- Highlight knowledge distribution and team collaboration patterns
- Offer actionable recommendations for better code organization
- Help inform architectural decisions and refactoring priorities

## Follow-up Actions

After completing the analysis:
1. **Document Findings**: Create or update directory README with purpose and structure
2. **Plan Improvements**: Prioritize structural refactoring based on identified issues
3. **Knowledge Sharing**: Schedule sessions to address knowledge concentration
4. **Monitoring**: Set up tracking for concerning patterns (rapid growth, single contributors)
5. **Team Discussion**: Review findings with team to align on organizational standards

## Advanced Analysis Techniques

### Cross-Directory Impact Analysis:
- Analyze how changes in one directory affect others
- Track dependency evolution between directories
- Identify architectural coupling issues

### Feature Development Tracking:
- Correlate directory changes with feature development cycles
- Analyze how new features impact existing directory structure
- Track technical debt accumulation during feature development

### Team Productivity Assessment:
- Measure how directory organization affects development velocity
- Identify bottlenecks caused by poor structure or knowledge silos
- Assess impact of refactoring on team productivity
