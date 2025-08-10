import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Chrome, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SignInWithGoogle() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result when component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          
          // Try to save user data to Firestore, but don't fail if permissions are restricted
          try {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
              // Create user document with Google profile data
              await setDoc(userDocRef, {
                email: user.email,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                photo: user.photoURL || '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          } catch (firestoreError: any) {
            console.warn("Could not save user data to Firestore:", firestoreError.message);
            // Continue with success message even if Firestore save fails
          }
          
          toast.success("Successfully signed in with Google!", {
            position: "top-center",
          });
          
          // Navigate to home page
          navigate("/");
        }
      } catch (error: any) {
        console.error("Google sign-in redirect error:", error);
        if (error.code !== 'auth/cancelled-popup-request') {
          toast.error(error.message || "Google sign-in failed. Please try again.", {
            position: "bottom-center",
          });
        }
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    // Configure provider settings
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    setIsLoading(true);
    
    try {
      // Use popup instead of redirect for better UX
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Try to save user data to Firestore
      try {
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user document with Google profile data
          await setDoc(userDocRef, {
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            photo: user.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (firestoreError: any) {
        console.warn("Could not save user data to Firestore:", firestoreError.message);
      }
      
      toast.success("Successfully signed in with Google!", {
        position: "top-center",
      });
      
      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Handle specific error cases
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User cancelled - don't show error toast
        return;
      } else {
        toast.error(error.message || "Google sign-in failed. Please try again.", {
          position: "bottom-center",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <button
        onClick={googleLogin}
        disabled={isLoading}
        type="button"
        className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <Chrome className="w-5 h-5 text-red-500" />
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

export default SignInWithGoogle;