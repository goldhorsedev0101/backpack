import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, Shield, Plus, X, Save, Heart, Phone, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Blood types
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

export default function EmergencyInfo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Fetch emergency info
  const { data: emergencyInfo, isLoading } = useQuery<any>({
    queryKey: ["/api/emergency-info"],
  });

  // Initialize contacts from fetched data
  useEffect(() => {
    if (emergencyInfo?.emergencyContacts) {
      setContacts(emergencyInfo.emergencyContacts);
    }
  }, [emergencyInfo]);

  const emergencyInfoSchema = z.object({
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
    medications: z.string().optional(),
    medicalConditions: z.string().optional(),
    doctorName: z.string().optional(),
    doctorPhone: z.string().optional(),
    insuranceProvider: z.string().optional(),
    policyNumber: z.string().optional(),
    insuranceEmergencyPhone: z.string().optional(),
    additionalNotes: z.string().optional(),
  });

  type EmergencyInfoFormData = z.infer<typeof emergencyInfoSchema>;

  const form = useForm<EmergencyInfoFormData>({
    resolver: zodResolver(emergencyInfoSchema),
    defaultValues: {
      bloodType: emergencyInfo?.bloodType || "",
      allergies: emergencyInfo?.allergies || "",
      medications: emergencyInfo?.medications || "",
      medicalConditions: emergencyInfo?.medicalConditions || "",
      doctorName: emergencyInfo?.doctorName || "",
      doctorPhone: emergencyInfo?.doctorPhone || "",
      insuranceProvider: emergencyInfo?.insuranceProvider || "",
      policyNumber: emergencyInfo?.policyNumber || "",
      insuranceEmergencyPhone: emergencyInfo?.insuranceEmergencyPhone || "",
      additionalNotes: emergencyInfo?.additionalNotes || "",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (emergencyInfo) {
      form.reset({
        bloodType: emergencyInfo.bloodType || "",
        allergies: emergencyInfo.allergies || "",
        medications: emergencyInfo.medications || "",
        medicalConditions: emergencyInfo.medicalConditions || "",
        doctorName: emergencyInfo.doctorName || "",
        doctorPhone: emergencyInfo.doctorPhone || "",
        insuranceProvider: emergencyInfo.insuranceProvider || "",
        policyNumber: emergencyInfo.policyNumber || "",
        insuranceEmergencyPhone: emergencyInfo.insuranceEmergencyPhone || "",
        additionalNotes: emergencyInfo.additionalNotes || "",
      });
      if (emergencyInfo.emergencyContacts) {
        setContacts(emergencyInfo.emergencyContacts);
      }
    }
  }, [emergencyInfo, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: EmergencyInfoFormData) => {
      return await apiRequest("/api/emergency-info", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          emergencyContacts: contacts,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-info"] });
      toast({
        title: t("emergency.saved"),
        description: t("emergency.saved_description"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("emergency.error"),
        description: t("emergency.error_description"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    saveMutation.mutate(data);
  });

  const addContact = () => {
    setContacts([...contacts, { name: "", relationship: "", phone: "", email: "" }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">{t("emergency.title")}</h1>
          </div>
          <p className="text-gray-600 text-lg">{t("emergency.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emergency Contacts */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  <CardTitle>{t("emergency.emergency_contacts")}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  data-testid="button-add-contact"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("emergency.add_contact")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-6">{t("emergency.no_info")}</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm text-gray-700">
                              {t("emergency.contact_name")} {index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(index)}
                            data-testid={`button-remove-contact-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`contact-name-${index}`}>{t("emergency.contact_name")}</Label>
                            <Input
                              id={`contact-name-${index}`}
                              value={contact.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, "name", e.target.value)}
                              placeholder={t("emergency.enter_contact_name")}
                              data-testid={`input-contact-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contact-relationship-${index}`}>
                              {t("emergency.contact_relationship")}
                            </Label>
                            <Input
                              id={`contact-relationship-${index}`}
                              value={contact.relationship}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, "relationship", e.target.value)}
                              placeholder={t("emergency.enter_relationship")}
                              data-testid={`input-contact-relationship-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contact-phone-${index}`}>{t("emergency.contact_phone")}</Label>
                            <Input
                              id={`contact-phone-${index}`}
                              value={contact.phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, "phone", e.target.value)}
                              placeholder={t("emergency.enter_phone")}
                              data-testid={`input-contact-phone-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`contact-email-${index}`}>{t("emergency.contact_email")}</Label>
                            <Input
                              id={`contact-email-${index}`}
                              value={contact.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, "email", e.target.value)}
                              placeholder={t("emergency.enter_email")}
                              data-testid={`input-contact-email-${index}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-500" />
                <CardTitle>{t("emergency.medical_information")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bloodType">{t("emergency.blood_type")}</Label>
                  <Select
                    value={form.watch("bloodType")}
                    onValueChange={(value: string) => form.setValue("bloodType", value)}
                  >
                    <SelectTrigger id="bloodType" data-testid="select-blood-type">
                      <SelectValue placeholder={t("emergency.select_blood_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="allergies">{t("emergency.allergies")}</Label>
                  <Input
                    id="allergies"
                    {...form.register("allergies")}
                    placeholder={t("emergency.enter_allergies")}
                    data-testid="input-allergies"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="medications">{t("emergency.medications")}</Label>
                  <Textarea
                    id="medications"
                    {...form.register("medications")}
                    placeholder={t("emergency.enter_medications")}
                    rows={3}
                    data-testid="textarea-medications"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="medicalConditions">{t("emergency.medical_conditions")}</Label>
                  <Textarea
                    id="medicalConditions"
                    {...form.register("medicalConditions")}
                    placeholder={t("emergency.enter_conditions")}
                    rows={3}
                    data-testid="textarea-medical-conditions"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">{t("emergency.doctor_info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName">{t("emergency.doctor_name")}</Label>
                    <Input
                      id="doctorName"
                      {...form.register("doctorName")}
                      placeholder={t("emergency.enter_doctor_name")}
                      data-testid="input-doctor-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorPhone">{t("emergency.doctor_phone")}</Label>
                    <Input
                      id="doctorPhone"
                      {...form.register("doctorPhone")}
                      placeholder={t("emergency.enter_doctor_phone")}
                      data-testid="input-doctor-phone"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-500" />
                <CardTitle>{t("emergency.insurance_information")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="insuranceProvider">{t("emergency.insurance_provider")}</Label>
                  <Input
                    id="insuranceProvider"
                    {...form.register("insuranceProvider")}
                    placeholder={t("emergency.enter_insurance_provider")}
                    data-testid="input-insurance-provider"
                  />
                </div>
                <div>
                  <Label htmlFor="policyNumber">{t("emergency.policy_number")}</Label>
                  <Input
                    id="policyNumber"
                    {...form.register("policyNumber")}
                    placeholder={t("emergency.enter_policy_number")}
                    data-testid="input-policy-number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="insuranceEmergencyPhone">{t("emergency.emergency_phone")}</Label>
                  <Input
                    id="insuranceEmergencyPhone"
                    {...form.register("insuranceEmergencyPhone")}
                    placeholder={t("emergency.enter_emergency_phone")}
                    data-testid="input-insurance-emergency-phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("emergency.additional_notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...form.register("additionalNotes")}
                placeholder={t("emergency.enter_notes")}
                rows={4}
                data-testid="textarea-additional-notes"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
              disabled={saveMutation.isPending}
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t("emergency.saving")}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {t("emergency.save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
