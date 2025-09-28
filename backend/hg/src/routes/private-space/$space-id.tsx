"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Manufacturer } from "@/schema";
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  usePublishToPublicSpace,
  useQuery,
  useSpace,
  useSpaces,
} from "@graphprotocol/hypergraph-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/private-space/$space-id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { "space-id": spaceId } = Route.useParams();

  return (
    <HypergraphSpaceProvider space={spaceId}>
      <PrivateSpace />
    </HypergraphSpaceProvider>
  );
}

function PrivateSpace() {
  const { name, ready, id: spaceId } = useSpace({ mode: "private" });
  const { data: manufacturers } = useQuery(Manufacturer, { mode: "private" });
  const { data: publicSpaces } = useSpaces({ mode: "public" });

  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const createManufacturer = useCreateEntity(Manufacturer);

  const [formData, setFormData] = useState({
    name: "",
    license: "",
    email: "",
  });

  const { mutate: publishToPublicSpace, isPending } = usePublishToPublicSpace({
    onSuccess: () => alert("Manufacturer published to your public space"),
    onError: () => alert("Error publishing manufacturer"),
  });

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading space...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createManufacturer({
      name: formData.name,
      license: formData.license,
      email: formData.email,
      isVerified: false,
      isActive: true,
      registeredAt: Date.now(),
    });
    setFormData({ name: "", license: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-600 mt-1 text-sm">Private Space</p>
          <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
          <p className="text-slate-600 mt-1 text-sm">ID: {spaceId}</p>
          <p className="text-muted-foreground mt-6">
            Manage your private manufacturers and publish them to public spaces
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create Manufacturer Form */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Add Manufacturer
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="manufacturer-name"
                    className="text-sm font-medium text-card-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="manufacturer-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter manufacturer name..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="manufacturer-license"
                    className="text-sm font-medium text-card-foreground"
                  >
                    License
                  </label>
                  <input
                    id="manufacturer-license"
                    type="text"
                    value={formData.license}
                    onChange={(e) =>
                      setFormData({ ...formData, license: e.target.value })
                    }
                    placeholder="Enter license number..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="manufacturer-email"
                    className="text-sm font-medium text-card-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="manufacturer-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter contact email..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Manufacturer
                </Button>
              </form>
            </div>
          </div>

          {/* Manufacturers List */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Your Manufacturers ({manufacturers?.length || 0})
              </h2>

              {manufacturers && manufacturers.length > 0 ? (
                <div className="space-y-4">
                  {manufacturers.map((m) => (
                    <div
                      key={m.id}
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      <h3 className="font-medium text-foreground">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: {m.id}</p>
                      <p className="text-sm text-muted-foreground">
                        License: {m.license}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Email: {m.email}
                      </p>

                      <div className="mt-4 space-y-2">
                        <label
                          htmlFor="space"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Select Public Space
                        </label>
                        <select
                          value={selectedSpace}
                          onChange={(e) => setSelectedSpace(e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Choose a public space...</option>
                          {publicSpaces?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <Button
                          onClick={() =>
                            publishToPublicSpace({
                              entity: m,
                              spaceId: selectedSpace,
                            })
                          }
                          disabled={!selectedSpace || isPending}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Publish to Public Space
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No manufacturers yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first manufacturer using the form
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
