#!/usr/bin/env python3
"""
Launcher script for GlobeMate Collector
"""
import os
import sys

# Add the Python packages to path
sys.path.insert(0, '/home/runner/workspace/.pythonlibs/lib/python3.11/site-packages')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)