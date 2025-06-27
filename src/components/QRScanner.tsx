
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
}

const QRScanner = ({ onScan, onError }: QRScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 1,
    };

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    const onScanSuccess = (decodedText: string) => {
      console.log('QR Code scanned:', decodedText);
      scanner.clear();
      onScan(decodedText);
    };

    const onScanFailure = (error: string) => {
      // We don't want to show every scan failure as it's normal during scanning
      console.debug('QR Scan failure:', error);
    };

    try {
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize QR scanner:', err);
      setError('Failed to initialize camera. Please ensure you have granted camera permissions.');
      onError('Failed to initialize camera');
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, [onScan, onError]);

  return (
    <Card>
      <CardContent className="p-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold">Camera Scanner</span>
            </div>
            
            <div id="qr-reader" className="w-full"></div>
            
            {!isInitialized && (
              <div className="text-center text-gray-600 mt-4">
                <p>Initializing camera...</p>
                <p className="text-sm mt-2">Please allow camera access when prompted</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
