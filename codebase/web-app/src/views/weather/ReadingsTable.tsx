import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatReadingTime } from '@/lib/weather-format';
import type { WeatherReading } from '@/types/weather';

type ReadingsTableProps = {
  readings: WeatherReading[];
};

export default function ReadingsTable({ readings }: ReadingsTableProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Temp</TableHead>
            <TableHead className="text-right">Humidity</TableHead>
            <TableHead className="text-right">Soil</TableHead>
            <TableHead className="text-right">Rain</TableHead>
            <TableHead className="text-right">Fire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-20 text-center text-muted-foreground"
                colSpan={6}
              >
                No weather readings recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            readings.map((reading) => (
              <TableRow key={reading.id}>
                <TableCell className="min-w-48 font-mono text-xs">
                  {formatReadingTime(reading.timestamp)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(reading.temperature, '°C')}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(reading.humidity, '%')}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(reading.soilMoisture, '%')}
                </TableCell>
                <TableCell className="text-right">
                  {reading.rain ? 'Detected' : 'Clear'}
                </TableCell>
                <TableCell className="text-right">
                  {reading.fire ? 'Detected' : 'Clear'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
