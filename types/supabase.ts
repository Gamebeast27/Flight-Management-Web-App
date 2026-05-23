export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string
          flight_no: string
          origin: string
          destination: string
          departs_at: string
          arrives_at: string
          aircraft_type: string
          status: 'scheduled' | 'delayed' | 'cancelled' | 'completed'
          base_price: number
        }
        Insert: {
          id?: string
          flight_no: string
          origin: string
          destination: string
          departs_at: string
          arrives_at: string
          aircraft_type: string
          status?: 'scheduled' | 'delayed' | 'cancelled' | 'completed'
          base_price: number
        }
        Update: Partial<Database['public']['Tables']['flights']['Insert']>
        Relationships: []
      }
      seats: {
        Row: {
          id: string
          flight_id: string
          seat_number: string
          class: 'economy' | 'business' | 'first'
          is_available: boolean
          extra_fee: number
        }
        Insert: {
          id?: string
          flight_id: string
          seat_number: string
          class: 'economy' | 'business' | 'first'
          is_available?: boolean
          extra_fee?: number
        }
        Update: Partial<Database['public']['Tables']['seats']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'seats_flight_id_fkey'
            columns: ['flight_id']
            referencedRelation: 'flights'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          flight_id: string
          seat_id: string
          status: 'confirmed' | 'cancelled' | 'rescheduled'
          booked_at: string
          total_price: number
          pnr_code: string
        }
        Insert: {
          id?: string
          user_id: string
          flight_id: string
          seat_id: string
          status?: 'confirmed' | 'cancelled' | 'rescheduled'
          booked_at?: string
          total_price: number
          pnr_code: string
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'bookings_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_flight_id_fkey'
            columns: ['flight_id']
            referencedRelation: 'flights'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_seat_id_fkey'
            columns: ['seat_id']
            referencedRelation: 'seats'
            referencedColumns: ['id']
          }
        ]
      }
      passengers: {
        Row: {
          id: string
          booking_id: string
          full_name: string
          passport_no: string
          nationality: string
          dob: string
        }
        Insert: {
          id?: string
          booking_id: string
          full_name: string
          passport_no: string
          nationality: string
          dob: string
        }
        Update: Partial<Database['public']['Tables']['passengers']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'passengers_booking_id_fkey'
            columns: ['booking_id']
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          }
        ]
      }
      reschedules: {
        Row: {
          id: string
          booking_id: string
          old_flight_id: string
          new_flight_id: string
          requested_at: string
          fee_charged: number
        }
        Insert: {
          id?: string
          booking_id: string
          old_flight_id: string
          new_flight_id: string
          requested_at?: string
          fee_charged?: number
        }
        Update: Partial<Database['public']['Tables']['reschedules']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'reschedules_booking_id_fkey'
            columns: ['booking_id']
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reschedules_old_flight_id_fkey'
            columns: ['old_flight_id']
            referencedRelation: 'flights'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reschedules_new_flight_id_fkey'
            columns: ['new_flight_id']
            referencedRelation: 'flights'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      reserve_seat: {
        Args: {
          p_seat_id: string
          p_user_id: string
          p_flight_id: string
        }
        Returns: Array<{ booking_id: string; pnr_code: string }>
      }
      cancel_booking: {
        Args: {
          p_booking_id: string
        }
        Returns: void
      }
      reschedule_booking: {
        Args: {
          p_booking_id: string
          p_new_flight_id: string
        }
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
