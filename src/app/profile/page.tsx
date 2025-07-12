import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  Clock,
  Globe,
  Phone,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-row">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              VentaRapida
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/">
                  <Package />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="/dashboard">
                  <LineChart />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={true}>
                <Link href="/profile">
                  <User />
                  Profile
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40" alt="User avatar" data-ai-hint="male user"/>
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin</span>
              <span className="text-xs text-muted-foreground">
                admin@ventarapida.com
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-2xl font-bold font-headline md:hidden">
            Profile & Contact
          </h2>
          <div className="flex items-center gap-4">
            {/* Potentially add actions here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">
                Profile & Contact
              </h2>
              <p className="text-muted-foreground">
                Manage your availability and contact information.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle>Availability</CardTitle>
                </div>
                <CardDescription>
                  Set your working hours and time zone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                   <Select>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select a time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmt-3">
                          (GMT-3) Buenos Aires, Georgetown
                        </SelectItem>
                        <SelectItem value="gmt-4">
                          (GMT-4) Atlantic Time (Canada), Caracas
                        </SelectItem>
                        <SelectItem value="gmt-5">
                          (GMT-5) Eastern Time (US & Canada), Bogota, Lima
                        </SelectItem>
                        <SelectItem value="gmt-6">
                          (GMT-6) Central Time (US & Canada), Mexico City
                        </SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <Separator />
                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Switch id={`switch-${day.toLowerCase()}`} defaultChecked={day !== 'Saturday' && day !== 'Sunday'} />
                        <Label
                          htmlFor={`switch-${day.toLowerCase()}`}
                          className="text-base font-medium"
                        >
                          {day}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="09:00">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>-</span>
                        <Select defaultValue="17:00">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="17:00">05:00 PM</SelectItem>
                            <SelectItem value="18:00">06:00 PM</SelectItem>
                            <SelectItem value="19:00">07:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-500 rounded-md">
                        <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle>WhatsApp Integration</CardTitle>
                  </div>
                  <CardDescription>
                    Connect your WhatsApp Business account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                        <div>
                            <p className="font-semibold">Status</p>
                            <p className="text-sm text-destructive">Not Connected</p>
                        </div>
                        <Button>Connect</Button>
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                   <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <CardTitle>Contact Verification</CardTitle>
                  </div>
                  <CardDescription>
                    Verify your phone number via SMS to receive alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <Button className="w-full">Send Verification Code</Button>
                   <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Verify Code
                    </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
