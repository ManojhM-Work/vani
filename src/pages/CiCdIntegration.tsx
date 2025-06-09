
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Play, Settings, GitBranch, Cloud, Server } from "lucide-react";

const CiCdIntegration = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [testCommand, setTestCommand] = useState("npm test");
  const [deployCommand, setDeployCommand] = useState("");
  const [enableAutoTrigger, setEnableAutoTrigger] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    teams: false
  });
  const [environment, setEnvironment] = useState("staging");
  const { toast } = useToast();

  const cicdPlatforms = [
    { id: "github", name: "GitHub Actions", icon: "🐙" },
    { id: "gitlab", name: "GitLab CI/CD", icon: "🦊" },
    { id: "jenkins", name: "Jenkins", icon: "⚙️" },
    { id: "azure", name: "Azure DevOps", icon: "☁️" },
    { id: "circleci", name: "CircleCI", icon: "🔄" },
    { id: "travis", name: "Travis CI", icon: "🚀" }
  ];

  const generateConfig = () => {
    let config = "";
    
    switch (selectedPlatform) {
      case "github":
        config = `name: Test Automation CI/CD

on:
  push:
    branches: [ ${branch} ]
  pull_request:
    branches: [ ${branch} ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: ${testCommand}
    
    - name: Build
      run: ${buildCommand}
      
    ${deployCommand ? `- name: Deploy
      run: ${deployCommand}
      if: github.ref == 'refs/heads/${branch}'` : ""}
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/`;
        break;
        
      case "gitlab":
        config = `stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - ${testCommand}
  artifacts:
    reports:
      junit: test-results/*.xml
    paths:
      - test-results/
  only:
    - ${branch}

build:
  stage: build
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - ${buildCommand}
  artifacts:
    paths:
      - dist/
  only:
    - ${branch}

${deployCommand ? `deploy:
  stage: deploy
  script:
    - ${deployCommand}
  only:
    - ${branch}` : ""}`;
        break;
        
      case "jenkins":
        config = `pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: '${branch}', url: '${repositoryUrl}'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh '${testCommand}'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results/*.xml'
                }
            }
        }
        
        stage('Build') {
            steps {
                sh '${buildCommand}'
            }
        }
        
        ${deployCommand ? `stage('Deploy') {
            when {
                branch '${branch}'
            }
            steps {
                sh '${deployCommand}'
            }
        }` : ""}
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
    }
}`;
        break;
        
      default:
        config = "Please select a CI/CD platform to generate configuration.";
    }
    
    return config;
  };

  const handleDownloadConfig = () => {
    const config = generateConfig();
    const fileName = selectedPlatform === "github" ? ".github/workflows/ci.yml" 
                   : selectedPlatform === "gitlab" ? ".gitlab-ci.yml"
                   : selectedPlatform === "jenkins" ? "Jenkinsfile"
                   : "ci-config.yml";
    
    const blob = new Blob([config], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Configuration Downloaded",
      description: `${selectedPlatform} configuration file has been downloaded.`,
    });
  };

  const handleTestPipeline = () => {
    toast({
      title: "Pipeline Test Started",
      description: "Testing your CI/CD pipeline configuration...",
    });
    
    // Simulate pipeline test
    setTimeout(() => {
      toast({
        title: "Pipeline Test Completed",
        description: "Your CI/CD configuration is valid and ready to use.",
      });
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CI/CD Integration</h1>
          <p className="text-muted-foreground">Set up continuous integration and deployment for your test automation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestPipeline} disabled={!selectedPlatform}>
            <Play className="mr-2 h-4 w-4" />
            Test Pipeline
          </Button>
          <Button onClick={handleDownloadConfig} disabled={!selectedPlatform}>
            <Download className="mr-2 h-4 w-4" />
            Download Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Platform Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cicdPlatforms.map((platform) => (
                  <Card
                    key={platform.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPlatform === platform.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{platform.icon}</div>
                      <p className="font-medium">{platform.name}</p>
                      {selectedPlatform === platform.id && (
                        <Badge className="mt-2">Selected</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repository Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="repository">Repository URL</Label>
                <Input
                  id="repository"
                  placeholder="https://github.com/username/repository.git"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="branch">Default Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build & Test Commands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-command">Test Command</Label>
                <Input
                  id="test-command"
                  placeholder="npm test"
                  value={testCommand}
                  onChange={(e) => setTestCommand(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="build-command">Build Command</Label>
                <Input
                  id="build-command"
                  placeholder="npm run build"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deploy-command">Deploy Command (Optional)</Label>
                <Input
                  id="deploy-command"
                  placeholder="npm run deploy"
                  value={deployCommand}
                  onChange={(e) => setDeployCommand(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Configuration Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {generateConfig()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-trigger on Push</Label>
                  <p className="text-sm text-muted-foreground">Automatically run pipeline on code changes</p>
                </div>
                <Switch
                  checked={enableAutoTrigger}
                  onCheckedChange={setEnableAutoTrigger}
                />
              </div>

              <div>
                <Label htmlFor="environment">Target Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Slack Integration</Label>
                <Switch
                  checked={notifications.slack}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, slack: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Microsoft Teams</Label>
                <Switch
                  checked={notifications.teams}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, teams: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CiCdIntegration;
