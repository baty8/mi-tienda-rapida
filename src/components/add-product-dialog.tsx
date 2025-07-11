"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, UploadCloud, ArrowLeft } from 'lucide-react';
import { Progress } from './ui/progress';

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Add New Product</DialogTitle>
          <DialogDescription>
            Follow the steps to add a new product to your store.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
                {step > 1 && (
                    <Button variant="ghost" size="icon" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-2">Step {step} of {totalSteps}</p>
                    <Progress value={progress} className="w-full" />
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-4 pt-4">
                    <h3 className="font-semibold font-headline">Basic Information</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" placeholder="e.g. Artisan Ceramic Mug" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" placeholder="e.g. Homeware" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your product..."/>
                    </div>
                </div>
            )}
            
            {step === 2 && (
                 <div className="space-y-4 pt-4">
                    <h3 className="font-semibold font-headline">Product Media</h3>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                    </div> 
                </div>
            )}

            {step === 3 && (
                 <div className="space-y-4 pt-4">
                    <h3 className="font-semibold font-headline">Pricing and Inventory</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" placeholder="25.00" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" type="number" placeholder="150" />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {step < totalSteps && (
            <Button onClick={nextStep}>Next Step</Button>
          )}
          {step === totalSteps && (
            <Button onClick={() => {
                // Handle form submission logic
                setOpen(false);
                setStep(1);
            }}>Finish & Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
