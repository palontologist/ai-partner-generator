"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Sparkles, Heart, Zap, Users } from "lucide-react"
import Link from "next/link"

export default function FindYourAIPartner() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPartner, setGeneratedPartner] = useState<string | null>(null)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAIPartner = async () => {
    if (!userPhoto || !description.trim()) return

    setIsGenerating(true)
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // For now, use a placeholder image since no AI integration is available
    setGeneratedPartner("/beautiful-ai-partner-portrait.jpg")
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-400" />
              <Sparkles className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              findyourAIpartner
            </h1>
          </div>
          <p className="text-center text-lg text-gray-300 mt-2">
            Upload your photo, describe yourself, and discover your perfect AI companion
          </p>
          <div className="flex justify-center mt-6">
            <Link href="/ai-generator">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                <Users className="h-4 w-4 mr-2" />
                Try AI Teammate Generator
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Upload className="h-6 w-6 text-cyan-400" />
                Create Your Profile
              </CardTitle>
              <CardDescription className="text-gray-300">Share your photo and tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-white">
                  Your Photo
                </Label>
                <div className="relative">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="bg-white/10 border-white/20 text-white file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                  />
                </div>
                {userPhoto && (
                  <div className="mt-4">
                    <img
                      src={userPhoto || "/placeholder.svg"}
                      alt="Your photo"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-cyan-400/50"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Describe Yourself
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your personality, interests, and what you're looking for in an AI partner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-32"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateAIPartner}
                disabled={!userPhoto || !description.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 text-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Your AI Partner...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generate My AI Partner
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-pink-400" />
                Your AI Partner
              </CardTitle>
              <CardDescription className="text-gray-300">Meet your perfect digital companion</CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedPartner && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-pink-400" />
                  </div>
                  <p className="text-gray-400">Upload your photo and description to generate your AI partner</p>
                </div>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  </div>
                  <p className="text-white font-medium">Creating your perfect match...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
                </div>
              )}

              {generatedPartner && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={generatedPartner || "/placeholder.svg"}
                      alt="Your AI Partner"
                      className="w-full h-64 object-cover rounded-lg border-2 border-pink-400/50"
                    />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      AI Generated
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-2">Meet Your AI Partner</h3>
                    <p className="text-gray-300 text-sm">
                      Based on your photo and description, we've created a unique AI companion that complements your
                      personality and interests.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setGeneratedPartner(null)
                      setUserPhoto(null)
                      setDescription("")
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Generate Another Partner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-400 text-sm">Simply upload your photo and describe yourself</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">AI Powered</h3>
              <p className="text-gray-400 text-sm">Advanced AI creates your perfect digital companion</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10 backdrop-blur-sm text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Perfect Match</h3>
              <p className="text-gray-400 text-sm">Discover your ideal AI partner tailored to you</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
