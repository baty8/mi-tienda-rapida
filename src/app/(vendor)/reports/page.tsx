
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Wand2, Loader2, Trash2, Eye, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useProduct } from '@/context/ProductContext';
import { generateReport } from '@/ai/flows/report-generator-flow';
import { type GenerateReportInput, type GenerateReportOutput } from '@/ai/flows/types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSupabase } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

const reportTemplates = [
  { id: 'catalog', name: 'Análisis de Catálogo', description: 'Un resumen de la composición y estado de tu catálogo.' },
  { id: 'stock', name: 'Análisis de Stock', description: 'Identifica productos con mucho o poco stock y recibe sugerencias.' },
  { id: 'pricing_margins', name: 'Análisis de Precios y Márgenes', description: 'Revisa la rentabilidad y la estructura de precios de tus productos.' },
];

type ReportRecord = {
    id: string;
    report_type: string;
    generated_at: string;
    content: string;
    title: string; // This will be added client-side
    criteria: any;
}

export default function ReportsPage() {
    const { products } = useProduct();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastGeneratedReport, setLastGeneratedReport] = useState<GenerateReportOutput & {reportType: string; criteria: any;} | null>(null);
    const [history, setHistory] = useState<ReportRecord[]>([]);
    const [viewingReport, setViewingReport] = useState<ReportRecord | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const supabase = getSupabase();

    const getTitleFromType = (type: string) => {
        return reportTemplates.find(t => t.id === type)?.name || 'Reporte';
    }

    const fetchHistory = useCallback(async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('reports')
            .select('id, report_type, generated_at, content, criteria')
            .eq('user_id', user.id)
            .order('generated_at', { ascending: false });
        
        if (error) {
            toast.error("Error", { description: "No se pudo cargar el historial de reportes." });
        } else {
            const formattedHistory = data.map(r => ({
                ...r,
                title: getTitleFromType(r.report_type),
            }))
            setHistory(formattedHistory as ReportRecord[]);
        }
        setHistoryLoaded(true); 
    }, [supabase]);

    useEffect(() => {
        if (!historyLoaded) {
            fetchHistory();
        }
    }, [historyLoaded, fetchHistory]);


    const handleGenerateReport = async () => {
        if (!selectedTemplate) {
            toast.error("Error", { description: "Por favor, selecciona una plantilla." });
            return;
        }
        setLoading(true);
        setLastGeneratedReport(null);
        setViewingReport(null);

        try {
            const productData = products.map(p => ({ 
                id: p.id, 
                name: p.name, 
                price: p.price, 
                stock: p.stock, 
                cost: p.cost,
                visible: p.visible,
                category: p.category,
            }));
            
            const input: GenerateReportInput = {
                reportType: selectedTemplate as GenerateReportInput['reportType'],
                products: productData,
                criteria: { period: "actual" }
            };

            const report = await generateReport(input);
            setLastGeneratedReport({ ...report, reportType: selectedTemplate, criteria: input.criteria });

        } catch (error: any) {
            toast.error("Error al generar reporte", { description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveReport = async () => {
        if (!lastGeneratedReport || !supabase) {
            toast.error("Error", { description: "No hay reporte que guardar." });
            return;
        }
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Error", { description: "Debes iniciar sesión para guardar reportes."});
            setSaving(false);
            return;
        }

        const { error } = await supabase.from('reports').insert({
            user_id: user.id,
            report_type: lastGeneratedReport.reportType,
            content: lastGeneratedReport.content,
            criteria: lastGeneratedReport.criteria,
        });

        if (error) {
            toast.error("Error", { description: `No se pudo guardar el reporte: ${error.message}`});
        } else {
            toast.success("Éxito", { description: "Reporte guardado en tu historial." });
            fetchHistory(); // Refresh history
            setLastGeneratedReport(null); // Clear the temporary report
        }
        setSaving(false);
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('reports').delete().eq('id', reportId);
        if (error) {
            toast.error("Error", { description: "No se pudo eliminar el reporte." });
        } else {
            toast.success("Éxito", { description: "Reporte eliminado." });
            setHistory(prev => prev.filter(r => r.id !== reportId));
            if (viewingReport?.id === reportId) {
                setViewingReport(null);
            }
        }
    };
    
    const currentReport = viewingReport || (lastGeneratedReport ? { ...lastGeneratedReport, id: 'temp', generated_at: new Date().toISOString() } : null);

    return (
        <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
                <h2 className="text-xl font-bold font-headline">Reportes Inteligentes</h2>
                <div className="flex items-center gap-4"><ThemeToggle /></div>
            </header>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-12">
                    {/* Columna de Controles e Historial */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Generar Nuevo Reporte</CardTitle>
                                <CardDescription>Elige una plantilla para comenzar.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select onValueChange={setSelectedTemplate} value={selectedTemplate || ''} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una plantilla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTemplates.map(template => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground min-h-[30px]">
                                    {selectedTemplate && reportTemplates.find(t => t.id === selectedTemplate)?.description}
                                </p>
                                <Button className="w-full" onClick={handleGenerateReport} disabled={loading || !selectedTemplate || products.length === 0}>
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generando...</> : <><Wand2 className="mr-2 h-4 w-4" />Generar Reporte</>}
                                </Button>
                                {products.length === 0 && <p className="text-xs text-center text-destructive">Añade productos para generar reportes.</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>2. Historial</CardTitle>
                                <CardDescription>Revisa tus reportes generados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                    {history.length > 0 ? (
                                        <div className="space-y-2">
                                            {history.map(report => (
                                                <div key={report.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                                    <div>
                                                        <p className="text-sm font-medium">{report.title}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(report.generated_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => { setViewingReport(report); setLastGeneratedReport(null); }}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4"/>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle></AlertDialogHeader>
                                                                <AlertDialogDescription>Esta acción es permanente.</AlertDialogDescription>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>Eliminar</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-center text-muted-foreground py-8">No hay reportes guardados.</p>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna de Visualización de Reporte */}
                    <div className="md:col-span-8 lg:col-span-9">
                        <Card className="min-h-[70vh]">
                             <CardHeader className="flex flex-row justify-between items-center">
                                {currentReport ? (
                                    <div>
                                        <CardTitle>{currentReport.title}</CardTitle>
                                        <CardDescription>Generado: {new Date(currentReport.generated_at).toLocaleString()}</CardDescription>
                                    </div>
                                ) : (
                                     <CardTitle>Vista Previa del Reporte</CardTitle>
                                )}
                                {lastGeneratedReport && (
                                    <Button onClick={handleSaveReport} disabled={saving}>
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                        Guardar Reporte
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                                        <p>La IA está analizando tus datos...</p>
                                    </div>
                                )}
                                {!loading && currentReport && (
                                     <ScrollArea className="h-[calc(70vh-80px)]">
                                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline">
                                            {currentReport.content}
                                        </ReactMarkdown>
                                     </ScrollArea>
                                )}
                                {!loading && !currentReport && (
                                    <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                                        <FileText className="h-12 w-12 mb-4"/>
                                        <p className="font-semibold">Tu reporte aparecerá aquí.</p>
                                        <p className="text-sm">Genera un nuevo reporte o selecciona uno del historial para verlo.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
