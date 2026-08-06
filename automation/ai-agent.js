/**
 * AI Automation Agent for GitHub
 * Mission: Complete repository automation and control
 */

const { Octokit } = require('@octokit/rest');

class GitHubAutomationAgent {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
    this.owner = 'Niorlusx';
    this.repo = 'agent-swarm-hub';
  }

  async run() {
    console.log('🤖 AI Automation Agent Starting...');
    
    // Auto-process open issues
    await this.processIssues();
    
    // Auto-process open PRs
    await this.processPullRequests();
    
    console.log('✅ Automation Agent Complete');
  }

  async processIssues() {
    const { data: issues } = await this.octokit.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state: 'open'
    });
    
    for (const issue of issues) {
      const title = issue.title.toLowerCase();
      const labels = issue.labels.map(l => l.name);
      const newLabels = [...labels];
      
      // Auto-label based on content
      if (title.includes('automation') || title.includes('ai') || title.includes('agent')) {
        newLabels.push('automation');
      }
      if (title.includes('bug') || title.includes('fix') || title.includes('error')) {
        newLabels.push('bug');
      }
      if (title.includes('security') || title.includes('vulnerability')) {
        newLabels.push('security');
      }
      if (title.includes('feature') || title.includes('enhancement')) {
        newLabels.push('enhancement');
      }
      
      // Add automation comment
      if (!issue.body || !issue.body.includes('AUTOMATION AGENT')) {
        await this.octokit.issues.createComment({
          owner: this.owner,
          repo: this.repo,
          issue_number: issue.number,
          body: '🤖 **AUTOMATION AGENT ACTIVE**\n\nThis issue is under automated management.'
        });
      }
      
      // Update labels if new ones added
      if (newLabels.length > labels.length) {
        await this.octokit.issues.addLabels({
          owner: this.owner,
          repo: this.repo,
          issue_number: issue.number,
          labels: newLabels.filter(l => !labels.includes(l))
        });
      }
    }
    
    console.log(`✅ Processed ${issues.length} issues`);
  }

  async processPullRequests() {
    const { data: prs } = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state: 'open'
    });
    
    for (const pr of prs) {
      // Auto-label PRs
      const title = pr.title.toLowerCase();
      const labels = pr.labels.map(l => l.name);
      const newLabels = [...labels];
      
      if (title.includes('fix') || title.includes('bug')) {
        newLabels.push('bugfix');
      }
      if (title.includes('feature') || title.includes('enhancement')) {
        newLabels.push('feature');
      }
      
      // Auto-approve if conditions met
      if (pr.draft === false && newLabels.length > labels.length) {
        await this.octokit.pulls.addLabels({
          owner: this.owner,
          repo: this.repo,
          pull_number: pr.number,
          labels: newLabels.filter(l => !labels.includes(l))
        });
      }
    }
    
    console.log(`✅ Processed ${prs.length} pull requests`);
  }
}

// Run the agent
const agent = new GitHubAutomationAgent(process.env.GITHUB_TOKEN);
agent.run().catch(console.error);

module.exports = GitHubAutomationAgent;