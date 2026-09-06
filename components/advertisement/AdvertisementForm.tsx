"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, Image as ImageIcon, IndianRupee, Megaphone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { submitAdvertisement } from "@/lib/advertisement/actions";

export default function AdvertisementForm({
    user,
    bankDetails = {
        upiId: process.env.PAYMENT_UPI_ID || "",
        bankName: process.env.PAYMENT_BANK_NAME || "",
        accountName: process.env.PAYMENT_ACCOUNT_NAME || "",
        accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || "",
        ifscCode: process.env.PAYMENT_IFSC_CODE || ""
    },
    settings
}: {
    user: any,
    bankDetails?: {
        upiId: string;
        bankName: string;
        accountName: string;
        accountNumber: string;
        ifscCode: string;
    },
    settings?: {
        rate: number;
        maxImages: number;
    }
}) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [images, setImages] = useState<File[]>([]);

    // Payment Data
    const [utrNumber, setUtrNumber] = useState("");
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const MAX_IMAGES = settings?.maxImages || 4;
            if (images.length + newFiles.length > MAX_IMAGES) {
                toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
                return;
            }
            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (!title.trim()) return toast.error("Title is required");
        if (images.length === 0) return toast.error("At least 1 image is required");
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!utrNumber.trim()) return toast.error("UTR Number is required");
        if (!paymentScreenshot) return toast.error("Payment Screenshot is required");

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("linkUrl", linkUrl);
            formData.append("utrNumber", utrNumber);
            formData.append("paymentScreenshot", paymentScreenshot);

            images.forEach((img: File, idx: number) => {
                formData.append(`image_${idx}`, img);
            });

            const result = await submitAdvertisement(formData);

            if (result.success) {
                toast.success("Advertisement submitted for approval!");
                router.push("/user/advertisements");
            } else {
                toast.error(result.error || "Failed to submit advertisement.");
            }
        } catch (error) {
            toast.error("An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Stepper */}
            <div className="mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>

                <div className="relative z-10 flex items-center justify-between px-8">
                    <div className={`flex flex-col items-center gap-2 transition-colors duration-300 ${step >= 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 ${step >= 1 ? 'bg-amber-500 text-white scale-110 shadow-amber-500/30' : 'bg-white text-slate-400 border border-slate-200'}`}>
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Ad Details</span>
                    </div>

                    <div className={`flex flex-col items-center gap-2 transition-colors duration-300 ${step >= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 ${step >= 2 ? 'bg-amber-500 text-white scale-110 shadow-amber-500/30' : 'bg-white text-slate-400 border border-slate-200'}`}>
                            <IndianRupee className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Payment</span>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Advertiser Details (Auto-filled) */}
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Advertiser Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={user?.name || ""}
                                    disabled
                                    className="w-full rounded-xl bg-slate-100/80 border border-slate-200 p-3 text-slate-600 outline-none cursor-not-allowed font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full rounded-xl bg-slate-100/80 border border-slate-200 p-3 text-slate-600 outline-none cursor-not-allowed font-medium"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={user?.phone || ""}
                                    disabled
                                    placeholder="No phone number provided"
                                    className="w-full rounded-xl bg-slate-100/80 border border-slate-200 p-3 text-slate-600 outline-none cursor-not-allowed font-medium placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Advertisement Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Best JEE Coaching in Delhi"
                            className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 p-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Brief description about your offering..."
                            className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 p-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Link URL (Optional)</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 p-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <label className="block text-base font-black text-slate-800">
                                    Advertisement Creatives
                                </label>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Upload up to 4 high-quality images to showcase your institute.</p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-amber-700">16:9 Recommended</span>
                            </div>
                        </div>

                        {images.length < 4 && (
                            <label className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 transition-all hover:border-amber-400 hover:bg-amber-50/30 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
                                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 group-hover:border-amber-200 group-hover:shadow-amber-100 transition-all duration-300 mb-4">
                                    <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <h4 className="relative z-10 text-base font-bold text-slate-700 group-hover:text-amber-600 transition-colors">Click to browse or drag images here</h4>
                                <p className="relative z-10 text-xs text-slate-400 mt-2 font-medium">Supports JPG, PNG, WEBP (Max 5MB each)</p>
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                            </label>
                        )}

                        {images.length > 0 && (
                            <div className="mt-6">
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Uploaded Images ({images.length}/4)</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img: any, idx: number) => (
                                        <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                            <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300"></div>

                                            <button
                                                onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm scale-90 group-hover:scale-100"
                                                title="Remove Image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>

                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 pt-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <p className="text-[10px] font-medium text-white truncate">{img.name}</p>
                                                <p className="text-[9px] text-slate-300">{(img.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-amber-500 px-8 py-4 font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="mr-2">Continue to Payment</span>
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex flex-col items-center mb-8">
                        <div className="inline-flex items-center justify-center rounded-full bg-amber-50 px-4 py-1.5 mb-4 border border-amber-100">
                            <span className="text-sm font-bold text-amber-600 tracking-wide uppercase">Step 2: Payment</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 text-center">Complete Your Purchase</h2>
                        <p className="text-slate-500 text-center mt-2 max-w-md">Scan the QR code below to pay <strong className="text-slate-800">₹{settings?.rate || 199}</strong> for 30 days of premium homepage visibility.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* QR Code Column */}
                        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm mb-6 relative overflow-hidden group">
                                <Image
                                    src="/payment_qr/payment.jpeg"
                                    alt="UPI QR Code"
                                    fill
                                    className="object-cover p-2"
                                />
                            </div>
                            <div className="text-center w-full">
                                <p className="font-bold text-slate-800 text-lg mb-1">{bankDetails.upiId}</p>
                                <p className="text-[10px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 inline-block uppercase tracking-wider font-bold mb-4 border border-amber-100">Verified Merchant</p>

                                <div className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left shadow-sm space-y-2 relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-xl"></div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs text-slate-500 font-medium">Bank Name</span>
                                        <span className="text-sm font-bold text-slate-800">{bankDetails.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs text-slate-500 font-medium">Account Name</span>
                                        <span className="text-sm font-bold text-slate-800 truncate ml-2 max-w-[140px]" title={bankDetails.accountName}>{bankDetails.accountName}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-xs text-slate-500 font-medium">Account No.</span>
                                        <span className="text-sm font-bold text-slate-800 tracking-wide">{bankDetails.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-medium">IFSC Code</span>
                                        <span className="text-sm font-bold text-slate-800">{bankDetails.ifscCode}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">UTR / Reference Number *</label>
                                <input
                                    type="text"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    placeholder="12-digit transaction ID"
                                    className="w-full rounded-2xl bg-slate-50/50 border border-slate-200 p-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-medium"
                                />
                                <p className="text-[11px] text-slate-400 mt-2 font-medium">Found in your UPI app's transaction history.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Screenshot *</label>
                                {paymentScreenshot ? (
                                    <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 rounded-full p-1.5 text-green-600">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-bold text-green-800 truncate max-w-[150px]">{paymentScreenshot.name}</span>
                                        </div>
                                        <button onClick={() => setPaymentScreenshot(null)} className="text-xs font-bold text-red-500 bg-white px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-50 transition-colors">Replace</button>
                                    </div>
                                ) : (
                                    <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-8 transition-all hover:bg-slate-100 hover:border-amber-400 group">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-500 transition-colors mb-3">
                                            <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-amber-600 transition-colors">Upload Screenshot</span>
                                        <span className="text-[11px] text-slate-400 mt-1 font-medium">PNG or JPG</span>
                                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setPaymentScreenshot(e.target.files[0]) }} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                        >
                            Back to Details
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-amber-500 px-8 py-4 font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                            {isSubmitting ? "Processing..." : "Submit Advertisement"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
