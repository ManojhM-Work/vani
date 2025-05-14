
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileType2, FlaskConical, Gauge, History, Code } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data for recent conversions and tests
  const recentActivity = [
    { id: 1, name: "Postman to Swagger conversion", type: "conversion", date: "2023-05-12" },
    { id: 2, name: "API Performance Test", type: "performance", date: "2023-05-10" },
    { id: 3, name: "User Auth API Tests", type: "functional", date: "2023-05-08" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome to VANI</h2>
        <p className="text-muted-foreground">
          Convert between API specifications and run functional, automation, and performance tests.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/conversion">
          <Card className="hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">API Conversion</CardTitle>
              <FileType2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Convert between Postman, Swagger, JMX, Playwright and more
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/functional">
          <Card className="hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Functional Testing</CardTitle>
              <FlaskConical className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build and run functional API tests with a Postman-like interface
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/automation">
          <Card className="hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Automation Testing</CardTitle>
              <Code className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and manage automated test suites with Playwright
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/performance">
          <Card className="hover:bg-card/80 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Performance Testing</CardTitle>
              <Gauge className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Run JMeter-like performance tests with real-time monitoring
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest conversions and test runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <Badge variant={
                    activity.type === "conversion" 
                      ? "default" 
                      : activity.type === "functional" 
                        ? "secondary" 
                        : "outline"
                  }>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
