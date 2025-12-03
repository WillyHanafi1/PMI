import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
    name: string;
    size: number;
    url: string;
    uploadedAt: Date;
    status: 'uploading' | 'processing' | 'success' | 'error';
    message?: string;
}

export const ScoreUpload: React.FC = () => {
    const { userProfile } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<UploadedFile[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('File harus berupa JPG, PNG, atau PDF');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB');
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile || !userProfile) return;

        setUploading(true);
        setError(null);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('uploadedBy', userProfile.uid);
            formData.append('uploadedByName', userProfile.picName || userProfile.email);

            // TODO: Replace with actual n8n webhook URL
            const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/score-upload';

            // Upload to n8n
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();

            // Add to upload history
            const uploadedFile: UploadedFile = {
                name: selectedFile.name,
                size: selectedFile.size,
                url: result.fileUrl || '',
                uploadedAt: new Date(),
                status: 'processing',
                message: 'File sedang diproses oleh sistem OCR'
            };

            setUploadHistory(prev => [uploadedFile, ...prev]);
            setSelectedFile(null);

            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Gagal mengupload file');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
            case 'processing':
                return <Loader2 className="text-blue-600 animate-spin" size={20} />;
            case 'success':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'error':
                return <XCircle className="text-red-600" size={20} />;
        }
    };

    const getStatusText = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return 'Mengupload...';
            case 'processing':
                return 'Memproses...';
            case 'success':
                return 'Selesai';
            case 'error':
                return 'Gagal';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Form Penilaian</h1>
                    <p className="text-gray-600">Upload foto atau PDF form penilaian untuk diproses otomatis</p>
                </div>

                {/* Upload Area */}
                <div className="glass-card rounded-xl p-8 mb-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${selectedFile
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                            }`}
                    >
                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />

                        {selectedFile ? (
                            <div className="mb-4">
                                <File className="inline text-primary-600 mb-2" size={32} />
                                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-900 mb-2">
                                    Pilih File atau Drag & Drop
                                </p>
                                <p className="text-sm text-gray-600">
                                    Mendukung JPG, PNG, PDF (Maks. 10MB)
                                </p>
                            </div>
                        )}

                        <input
                            id="file-input"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="flex gap-4 justify-center">
                            <label
                                htmlFor="file-input"
                                className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-primary-500 text-gray-700 font-semibold rounded-lg cursor-pointer transition-all"
                            >
                                Pilih File
                            </label>

                            {selectedFile && (
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all flex items-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Mengupload...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} />
                                            <span>Upload</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <XCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 font-semibold mb-2">📋 Cara Kerja:</p>
                        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                            <li>Upload foto atau PDF form penilaian yang sudah diisi</li>
                            <li>Sistem akan mengirim ke n8n untuk proses OCR</li>
                            <li>Data nilai akan otomatis di-extract dan disimpan</li>
                            <li>Admin bisa review dan approve sebelum publish</li>
                        </ol>
                    </div>
                </div>

                {/* Upload History */}
                {uploadHistory.length > 0 && (
                    <div className="glass-card rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Riwayat Upload</h2>

                        <div className="space-y-3">
                            {uploadHistory.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <File className="text-gray-400 flex-shrink-0" size={24} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)} • {file.uploadedAt.toLocaleString('id-ID')}
                                            </p>
                                            {file.message && (
                                                <p className="text-xs text-gray-600 mt-1">{file.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(file.status)}
                                        <span className="text-sm font-semibold text-gray-700">
                                            {getStatusText(file.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">ℹ️ Informasi Penting</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Pastikan foto/PDF form penilaian jelas dan terbaca</li>
                        <li>• Tulisan harus rapi agar OCR bisa membaca dengan baik</li>
                        <li>• Setelah diproses, admin perlu approve sebelum nilai dipublish</li>
                        <li>• File akan tersimpan sebagai bukti dokumentasi</li>
                        <li>• Jika OCR gagal, bisa input manual lewat menu "Input Nilai"</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
