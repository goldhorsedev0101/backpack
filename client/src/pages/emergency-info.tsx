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
import { AlertCircle, Shield, Plus, X, Save, Heart, Phone, User, Edit, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  const [viewMode, setViewMode] = useState<boolean>(false);

  // Fetch emergency info
  const { data: emergencyInfo, isLoading } = useQuery<any>({
    queryKey: ["/api/emergency-info"],
  });

  // Initialize contacts from fetched data and set view mode if data exists
  useEffect(() => {
    if (emergencyInfo?.emergencyContacts) {
      setContacts(emergencyInfo.emergencyContacts);
    }
    // If there's saved data, show it in view mode
    if (emergencyInfo && Object.keys(emergencyInfo).length > 2) {
      setViewMode(true);
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
    passportNumber: z.string().optional(),
    passportExpiry: z.string().optional(),
    passportCountry: z.string().optional(),
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
      passportNumber: emergencyInfo?.passportNumber || "",
      passportExpiry: emergencyInfo?.passportExpiry || "",
      passportCountry: emergencyInfo?.passportCountry || "",
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
        passportNumber: emergencyInfo.passportNumber || "",
        passportExpiry: emergencyInfo.passportExpiry ? new Date(emergencyInfo.passportExpiry).toISOString().split('T')[0] : "",
        passportCountry: emergencyInfo.passportCountry || "",
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
      setViewMode(true); // Switch to view mode after save
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

  // View Mode Component
  if (viewMode && emergencyInfo) {
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

          {/* Emergency Info Summary Card */}
          <Card className="shadow-2xl border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 via-red-50 to-pink-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-2xl text-gray-900">{t("emergency.title")}</CardTitle>
                    <CardDescription className="text-gray-700 mt-1">
                      {t("emergency.saved_description")}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setViewMode(false)}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  data-testid="button-edit-info"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  ערוך
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {/* Emergency Contacts Section */}
              {contacts && contacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-800">{t("emergency.emergency_contacts")}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((contact, index) => (
                      <Card key={index} className="border-2 border-red-100 bg-gradient-to-br from-white to-red-50">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">{contact.name}</span>
                            </div>
                            {contact.relationship && (
                              <Badge variant="outline" className="text-xs">
                                {contact.relationship}
                              </Badge>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3 h-3" />
                                <span className="text-sm" dir="ltr">{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-3 h-3" />
                                <span className="text-sm break-all">{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Medical Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">{t("emergency.medical_information")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {emergencyInfo.bloodType && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">{t("emergency.blood_type")}</p>
                      <p className="text-lg font-bold text-blue-900">{emergencyInfo.bloodType}</p>
                    </div>
                  )}
                  {emergencyInfo.allergies && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">{t("emergency.allergies")}</p>
                      <p className="text-gray-800">{emergencyInfo.allergies}</p>
                    </div>
                  )}
                  {emergencyInfo.medications && (
                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">{t("emergency.medications")}</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{emergencyInfo.medications}</p>
                    </div>
                  )}
                  {emergencyInfo.medicalConditions && (
                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">{t("emergency.medical_conditions")}</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{emergencyInfo.medicalConditions}</p>
                    </div>
                  )}
                  {(emergencyInfo.doctorName || emergencyInfo.doctorPhone) && (
                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-3">{t("emergency.doctor_info")}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {emergencyInfo.doctorName && (
                          <div className="bg-white/50 p-3 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">{t("emergency.doctor_name")}</p>
                            <p className="text-gray-800 font-semibold text-right">{emergencyInfo.doctorName}</p>
                          </div>
                        )}
                        {emergencyInfo.doctorPhone && (
                          <div className="bg-white/50 p-3 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">{t("emergency.doctor_phone")}</p>
                            <p className="text-gray-800 font-semibold font-mono" dir="ltr">{emergencyInfo.doctorPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Insurance Information Section */}
              {(emergencyInfo.insuranceProvider || emergencyInfo.policyNumber || emergencyInfo.insuranceEmergencyPhone) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-xl font-bold text-gray-800">{t("emergency.insurance_information")}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {emergencyInfo.insuranceProvider && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">{t("emergency.insurance_provider")}</p>
                        <p className="text-lg font-bold text-green-900">{emergencyInfo.insuranceProvider}</p>
                      </div>
                    )}
                    {emergencyInfo.policyNumber && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">{t("emergency.policy_number")}</p>
                        <p className="text-gray-800 font-mono">{emergencyInfo.policyNumber}</p>
                      </div>
                    )}
                    {emergencyInfo.insuranceEmergencyPhone && (
                      <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">{t("emergency.emergency_phone")}</p>
                        <p className="text-lg font-bold text-green-900" dir="ltr">{emergencyInfo.insuranceEmergencyPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Passport Information Section */}
              {(emergencyInfo.passportNumber || emergencyInfo.passportExpiry || emergencyInfo.passportCountry) && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-purple-500" />
                      <h3 className="text-xl font-bold text-gray-800">{t("emergency.passport_information")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {emergencyInfo.passportNumber && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-600 mb-1">{t("emergency.passport_number")}</p>
                          <p className="text-lg font-bold text-purple-900 font-mono">{emergencyInfo.passportNumber}</p>
                        </div>
                      )}
                      {emergencyInfo.passportExpiry && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-600 mb-1">{t("emergency.passport_expiry")}</p>
                          <p className="text-gray-800 font-semibold">{new Date(emergencyInfo.passportExpiry).toLocaleDateString()}</p>
                        </div>
                      )}
                      {emergencyInfo.passportCountry && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-600 mb-1">{t("emergency.passport_country")}</p>
                          <p className="text-gray-800 font-semibold">{emergencyInfo.passportCountry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Additional Notes Section */}
              {emergencyInfo.additionalNotes && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                      <h3 className="text-xl font-bold text-gray-800">{t("emergency.additional_notes")}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{emergencyInfo.additionalNotes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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

          {/* Passport Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                <CardTitle>{t("emergency.passport_information")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="passportNumber">{t("emergency.passport_number")}</Label>
                  <Input
                    id="passportNumber"
                    {...form.register("passportNumber")}
                    placeholder={t("emergency.enter_passport_number")}
                    data-testid="input-passport-number"
                  />
                </div>
                <div>
                  <Label htmlFor="passportExpiry">{t("emergency.passport_expiry")}</Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    {...form.register("passportExpiry")}
                    placeholder={t("emergency.enter_passport_expiry")}
                    data-testid="input-passport-expiry"
                  />
                </div>
                <div>
                  <Label htmlFor="passportCountry">{t("emergency.passport_country")}</Label>
                  <Input
                    id="passportCountry"
                    {...form.register("passportCountry")}
                    placeholder={t("emergency.enter_passport_country")}
                    data-testid="input-passport-country"
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
                data-testid="input-additional-notes"
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
