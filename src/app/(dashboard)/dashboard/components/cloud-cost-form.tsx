"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bot, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCloudCostOptimizationSuggestions, CloudCostOptimizationInput } from "@/ai/flows/cloud-cost-optimization-suggestions";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  cloudProvider: z.enum(["AWS", "Azure", "GCP"], {
    required_error: "Please select a cloud provider.",
  }),
  spendingData: z.string().min(10, {
    message: "Spending data must be at least 10 characters.",
  }),
});

const exampleSpendingData = `{
  "services": [
    { "name": "EC2", "cost": 1200, "region": "us-east-1", "instances": [ { "id": "i-123", "type": "t2.micro", "running_hours": 720 } ] },
    { "name": "S3", "cost": 150, "storage_gb": 500 },
    { "name": "RDS", "cost": 400, "instance_type": "db.t2.medium" }
  ],
  "total_spend": 1750
}`;

export function CloudCostForm() {
  const [result, setResult] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spendingData: exampleSpendingData,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getCloudCostOptimizationSuggestions(values as CloudCostOptimizationInput);
      setResult(response.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setResult("An error occurred while fetching suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Cloud Cost Optimization</CardTitle>
        <CardDescription>Get AI-powered suggestions to reduce your cloud spend.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1">
          <CardContent className="space-y-4 flex-1">
            <FormField
              control={form.control}
              name="cloudProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cloud Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AWS">AWS</SelectItem>
                      <SelectItem value="Azure">Azure</SelectItem>
                      <SelectItem value="GCP">GCP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spendingData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spending Data (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your cloud spending data here"
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {result && (
              <div className="space-y-2">
                <FormLabel>Suggestions</FormLabel>
                <ScrollArea className="h-40 w-full rounded-md border p-4 text-sm bg-muted/50">
                    <pre className="whitespace-pre-wrap font-sans">{result}</pre>
                </ScrollArea>
              </div>
            )}
            {isLoading && !result && (
              <div className="flex items-center justify-center h-40 w-full rounded-md border text-sm bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Bot className="h-5 w-5 animate-pulse" />
                    <span>Analyzing spending data...</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Suggestions
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
